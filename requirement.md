# Requirements

## Problem Statement
Many qualified candidates are screened out because resumes lack ATS-friendly keywords, clear structure, and quantified achievements.

## Project Goals
- Increase interview callbacks by improving ATS compatibility
- Automate resume optimization with AI
- Provide instant ATS scoring and downloadable, polished outputs

## Functional Requirements
- Upload resumes in PDF and DOCX formats
- Build resumes manually via guided form
- Extract text from PDFs and DOCX files
- Parse resume into sections (Summary, Experience, Education, Skills)
- Compute ATS score (keywords, sections, formatting)
- Enhance resume text using OpenAI and Google Gemini (OpenAI/Gemini/Both)
- Store resumes, enhancements, and ATS scores in MongoDB
- Display dashboard with original and enhanced ATS scores and content
- Generate and download resume as PDF or DOCX
- Allow selection of enhancement model (OpenAI, Gemini, Both)

## Non-functional Requirements
- Response latency: file upload and enhancement endpoints should respond within reasonable time (enhancement may be longer due to LLM calls)
- Scalability: support concurrent users; LLM calls should be scalable or queued
- Security: store sensitive keys in environment variables; validate inputs; enable CORS appropriately
- Privacy: do not log full resume content; allow deletion of user data in DB
- Availability: backend should be runnable locally and deployable to cloud (e.g., Render)
- Accessibility: frontend should be keyboard-navigable and screen-reader friendly

## Tech Stack
- Frontend: React, Tailwind CSS, Radix UI, Axios, React Router
- Backend: FastAPI (Python), Motor (async MongoDB client)
- AI: OpenAI GPT-4o, Google Gemini
- Document processing: PyPDF2, python-docx, ReportLab
- Database: MongoDB

## Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB running on `localhost:27017`
- Environment variables for API keys:
  - `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`
  - `EMERGENT_LLM_KEY` or `OPENAI_API_KEY` and `GEMINI_API_KEY`

## Installation & Run (summary)
1. Backend
```bash
cd backend
pip install -r requirements.txt
# create .env with required vars
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
2. Frontend
```bash
cd frontend
npm install
# create .env with REACT_APP_BACKEND_URL if needed
npm start
```

## API Endpoints
- `POST /api/resume/upload` - Upload resume file (multipart)
- `POST /api/resume/manual` - Create resume manually (JSON)
- `POST /api/resume/enhance` - Enhance resume with AI (body: `resume_id`, `enhancement_type`)
- `GET /api/resume/{resume_id}` - Get resume and ATS score
- `POST /api/resume/generate/{resume_id}?format=pdf|docx` - Generate downloadable file

## Acceptance Criteria
- Upload accepts PDF/DOCX and stores parsed sections in DB
- ATS score returned and displayed on dashboard
- Enhancement returns improved text and higher or comparable ATS score
- Download returns valid PDF/DOCX matching displayed content
- Frontend routes (`/`, `/upload`, `/dashboard/:resumeId`) work end-to-end

## Notes
- LLM enhancement requires valid API keys; fallback returns original text with warning.
