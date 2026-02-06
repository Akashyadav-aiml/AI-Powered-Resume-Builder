from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from PyPDF2 import PdfReader
from docx import Document
import io
import re

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from . import llm_helper as llm_ops
from .auth import create_access_token, decode_token, verify_password, get_password_hash, Token

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Auth Security
security = HTTPBearer()

# Models - Auth
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

# Models
class ResumeSection(BaseModel):
    section_name: str
    content: str

class ResumeData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    raw_text: str
    sections: List[ResumeSection]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ATSScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resume_id: str
    overall_score: int
    keyword_score: int
    formatting_score: int
    section_score: int
    details: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnhancedResume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_resume_id: str
    enhanced_text: str
    enhanced_sections: List[ResumeSection]
    enhancement_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ManualResumeInput(BaseModel):
    full_name: str
    email: str
    phone: str
    summary: str
    experience: str
    education: str
    skills: str

class EnhanceRequest(BaseModel):
    resume_id: str
    enhancement_type: str = "both"

# Helper Functions
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF: {e}")
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF")

def extract_text_from_docx(file_content: bytes) -> str:
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX: {e}")
        raise HTTPException(status_code=400, detail="Failed to extract text from DOCX")

def parse_resume_sections(text: str) -> List[ResumeSection]:
    sections = []
    section_patterns = [
        (r"(SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE)\s*:?\s*([\s\S]*?)(?=\n\n|EXPERIENCE|EDUCATION|SKILLS|$)", "Summary"),
        (r"(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT)\s*:?\s*([\s\S]*?)(?=\n\n|EDUCATION|SKILLS|$)", "Experience"),
        (r"(EDUCATION|ACADEMIC BACKGROUND)\s*:?\s*([\s\S]*?)(?=\n\n|EXPERIENCE|SKILLS|$)", "Education"),
        (r"(SKILLS|TECHNICAL SKILLS|COMPETENCIES)\s*:?\s*([\s\S]*?)(?=\n\n|EXPERIENCE|EDUCATION|$)", "Skills"),
    ]
    
    for pattern, section_name in section_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            sections.append(ResumeSection(section_name=section_name, content=match.group(2).strip()))
    
    if not sections:
        sections.append(ResumeSection(section_name="Content", content=text))
    
    return sections

def calculate_ats_score(text: str, sections: List[ResumeSection]) -> ATSScore:
    keyword_list = [
        "python", "javascript", "react", "node", "fastapi", "mongodb", "sql",
        "aws", "docker", "kubernetes", "git", "agile", "scrum", "ci/cd",
        "leadership", "communication", "teamwork", "problem-solving",
        "bachelor", "master", "degree", "certified", "manager", "engineer"
    ]
    
    text_lower = text.lower()
    keyword_matches = sum(1 for kw in keyword_list if kw in text_lower)
    keyword_score = min(100, int((keyword_matches / len(keyword_list)) * 100))
    
    section_names = [s.section_name.lower() for s in sections]
    required_sections = ["experience", "education", "skills"]
    section_matches = sum(1 for req in required_sections if any(req in s for s in section_names))
    section_score = int((section_matches / len(required_sections)) * 100)
    
    has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
    has_phone = bool(re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
    has_consistent_format = len(text.split('\n')) > 5
    formatting_score = int(((has_email + has_phone + has_consistent_format) / 3) * 100)
    
    overall_score = int((keyword_score * 0.4 + section_score * 0.4 + formatting_score * 0.2))
    
    return ATSScore(
        resume_id="",
        overall_score=overall_score,
        keyword_score=keyword_score,
        formatting_score=formatting_score,
        section_score=section_score,
        details={
            "keyword_matches": keyword_matches,
            "total_keywords": len(keyword_list),
            "has_email": has_email,
            "has_phone": has_phone,
            "sections_found": [s.section_name for s in sections]
        }
    )

async def enhance_with_openai(text: str) -> str:
    return await llm_ops.enhance_with_openai(text)

async def enhance_with_gemini(text: str) -> str:
    return await llm_ops.enhance_with_gemini(text)

def generate_pdf(resume_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor='#111111',
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor='#0044CC',
        spaceAfter=6,
    )
    
    story = []
    
    if 'full_name' in resume_data:
        story.append(Paragraph(resume_data['full_name'], title_style))
        story.append(Paragraph(f"{resume_data.get('email', '')} | {resume_data.get('phone', '')}", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
    
    for section in resume_data.get('sections', []):
        story.append(Paragraph(section['section_name'], heading_style))
        story.append(Paragraph(section['content'].replace('\n', '<br/>'), styles['Normal']))
        story.append(Spacer(1, 0.15*inch))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_docx(resume_data: dict) -> bytes:
    doc = Document()
    
    if 'full_name' in resume_data:
        doc.add_heading(resume_data['full_name'], 0)
        doc.add_paragraph(f"{resume_data.get('email', '')} | {resume_data.get('phone', '')}")
    
    for section in resume_data.get('sections', []):
        doc.add_heading(section['section_name'], 1)
        doc.add_paragraph(section['content'])
    
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()

# API Endpoints

# Auth Endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_data.password)
        
        user_doc = {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "password_hash": hashed_password,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id, "email": user_data.email})
        
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        # Find user by email
        user = await db.users.find_one({"email": user_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(user_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
        
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.get("/auth/me", response_model=User)
async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = payload.get("sub")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user["created_at"] = datetime.fromisoformat(user["created_at"])
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# Helper to get current user from token
async def get_current_user_id(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

@api_router.get("/")
async def root():
    return {"message": "CareerArchitect API - AI Resume Builder"}

@api_router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    try:
        content = await file.read()
        
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(content)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(content)
        else:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        
        sections = parse_resume_sections(text)
        resume = ResumeData(raw_text=text, sections=sections)
        
        doc = resume.model_dump()
        doc['user_id'] = user_id
        doc['created_at'] = doc['created_at'].isoformat()
        await db.resumes.insert_one(doc)
        
        ats_score = calculate_ats_score(text, sections)
        ats_score.resume_id = resume.id
        score_doc = ats_score.model_dump()
        score_doc['user_id'] = user_id
        score_doc['created_at'] = score_doc['created_at'].isoformat()
        await db.ats_scores.insert_one(score_doc)
        
        return {
            "resume_id": resume.id,
            "text": text[:500],
            "sections": [s.model_dump() for s in sections],
            "ats_score": ats_score.model_dump()
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/resume/manual")
async def create_manual_resume(input_data: ManualResumeInput, user_id: str = Depends(get_current_user_id)):
    try:
        sections = [
            ResumeSection(section_name="Summary", content=input_data.summary),
            ResumeSection(section_name="Experience", content=input_data.experience),
            ResumeSection(section_name="Education", content=input_data.education),
            ResumeSection(section_name="Skills", content=input_data.skills)
        ]
        
        raw_text = f"{input_data.full_name}\n{input_data.email}\n{input_data.phone}\n\n"
        raw_text += f"Summary: {input_data.summary}\n\nExperience: {input_data.experience}\n\n"
        raw_text += f"Education: {input_data.education}\n\nSkills: {input_data.skills}"
        
        resume = ResumeData(raw_text=raw_text, sections=sections)
        
        doc = resume.model_dump()
        doc['user_id'] = user_id
        doc['created_at'] = doc['created_at'].isoformat()
        doc['full_name'] = input_data.full_name
        doc['email'] = input_data.email
        doc['phone'] = input_data.phone
        await db.resumes.insert_one(doc)
        
        ats_score = calculate_ats_score(raw_text, sections)
        ats_score.resume_id = resume.id
        score_doc = ats_score.model_dump()
        score_doc['user_id'] = user_id
        score_doc['created_at'] = score_doc['created_at'].isoformat()
        await db.ats_scores.insert_one(score_doc)
        
        return {
            "resume_id": resume.id,
            "sections": [s.model_dump() for s in sections],
            "ats_score": ats_score.model_dump()
        }
    except Exception as e:
        logger.error(f"Manual resume error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/resume/enhance")
async def enhance_resume(request: EnhanceRequest, user_id: str = Depends(get_current_user_id)):
    try:
        resume = await db.resumes.find_one({"id": request.resume_id}, {"_id": 0})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Verify ownership
        if resume.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        enhanced_text = ""
        enhancement_type = request.enhancement_type
        
        if enhancement_type == "openai":
            enhanced_text = await enhance_with_openai(resume['raw_text'])
        elif enhancement_type == "gemini":
            enhanced_text = await enhance_with_gemini(resume['raw_text'])
        else:
            openai_enhanced = await enhance_with_openai(resume['raw_text'])
            enhanced_text = await enhance_with_gemini(openai_enhanced)
        
        enhanced_sections = parse_resume_sections(enhanced_text)
        
        enhanced_resume = EnhancedResume(
            original_resume_id=request.resume_id,
            enhanced_text=enhanced_text,
            enhanced_sections=enhanced_sections,
            enhancement_type=enhancement_type
        )
        
        doc = enhanced_resume.model_dump()
        doc['user_id'] = user_id
        doc['created_at'] = doc['created_at'].isoformat()
        await db.enhanced_resumes.insert_one(doc)
        
        new_ats_score = calculate_ats_score(enhanced_text, enhanced_sections)
        new_ats_score.resume_id = enhanced_resume.id
        score_doc = new_ats_score.model_dump()
        score_doc['user_id'] = user_id
        score_doc['created_at'] = score_doc['created_at'].isoformat()
        await db.ats_scores.insert_one(score_doc)
        
        return {
            "enhanced_resume_id": enhanced_resume.id,
            "enhanced_text": enhanced_text,
            "enhanced_sections": [s.model_dump() for s in enhanced_sections],
            "new_ats_score": new_ats_score.model_dump()
        }
    except Exception as e:
        logger.error(f"Enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/resume/{resume_id}")
async def get_resume(resume_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        resume = await db.resumes.find_one({"id": resume_id}, {"_id": 0})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Verify ownership
        if resume.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        ats_score = await db.ats_scores.find_one({"resume_id": resume_id}, {"_id": 0})
        
        return {
            "resume": resume,
            "ats_score": ats_score
        }
    except Exception as e:
        logger.error(f"Get resume error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/resume/generate/{resume_id}")
async def generate_resume(resume_id: str, format: str = "pdf", user_id: str = Depends(get_current_user_id)):
    try:
        resume = await db.resumes.find_one({"id": resume_id}, {"_id": 0})
        if not resume:
            enhanced = await db.enhanced_resumes.find_one({"id": resume_id}, {"_id": 0})
            if not enhanced:
                raise HTTPException(status_code=404, detail="Resume not found")
            resume = enhanced
        
        # Verify ownership
        if resume.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        if format == "pdf":
            pdf_bytes = generate_pdf(resume)
            return {"file_data": pdf_bytes.hex(), "format": "pdf"}
        elif format == "docx":
            docx_bytes = generate_docx(resume)
            return {"file_data": docx_bytes.hex(), "format": "docx"}
        else:
            raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'docx'")
    except Exception as e:
        logger.error(f"Generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()