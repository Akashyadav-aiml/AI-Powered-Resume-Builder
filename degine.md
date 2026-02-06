# Design

## High-level Architecture
User → Frontend (React) → Backend (FastAPI) → MongoDB
                                ↘
                              OpenAI / Gemini (LLMs)

## Components
- Frontend (`frontend/src`)
  - Pages: `LandingPage`, `UploadPage`, `DashboardPage`
  - UI: Radix + Tailwind components
  - API helper: `frontend/src/lib/api.js`

- Backend (`backend/server.py`)
  - Endpoints for upload, manual create, enhance, fetch, and generate
  - Document parsing: `extract_text_from_pdf`, `extract_text_from_docx`
  - Section parsing: `parse_resume_sections`
  - ATS scoring: `calculate_ats_score`
  - LLM integration via `llm_helper.py` (`enhance_with_openai`, `enhance_with_gemini`)
  - PDF/DOCX generation: `generate_pdf`, `generate_docx`

- Database (MongoDB)
  - Collections: `resumes`, `ats_scores`, `enhanced_resumes`

## Data Models (summary)
- ResumeData
  - `id`, `raw_text`, `sections` (array of {section_name, content}), `created_at`, optional `full_name`, `email`, `phone`

- ATSScore
  - `id`, `resume_id`, `overall_score`, `keyword_score`, `formatting_score`, `section_score`, `details`, `created_at`

- EnhancedResume
  - `id`, `original_resume_id`, `enhanced_text`, `enhanced_sections`, `enhancement_type`, `created_at`

## Sequence Flows
1. Upload flow
  - User uploads file → backend extracts text → parse sections → save `ResumeData` → compute and save `ATSScore` → return `resume_id` and scores

2. Manual create
  - User submits form → server constructs `raw_text` and sections → save resume and ATS score

3. Enhancement flow
  - Dashboard calls `/api/resume/enhance` with `resume_id` and `enhancement_type`
  - Backend fetches resume → calls selected LLM(s) via `llm_helper` → receives enhanced text → parse sections → save `EnhancedResume` and new `ATSScore`

4. Generate flow
  - Client requests `/api/resume/generate/{id}?format=pdf|docx` → server builds file with ReportLab or python-docx → returns file bytes (hex-encoded)

## ATS Scoring Algorithm
- Keyword Score: percent match against a keyword list (e.g., `python`, `react`, `mongodb`, etc.)
- Section Score: presence of required sections (`experience`, `education`, `skills`)
- Formatting Score: checks for email, phone, and reasonable line count
- Overall Score = 0.4 * Keyword + 0.4 * Section + 0.2 * Formatting

## LLM Integration Details
- `llm_helper.py` centralizes OpenAI and Gemini calls
- Environment variables used: `OPENAI_API_KEY` or `EMERGENT_LLM_KEY`, `GEMINI_API_KEY`
- If key missing, helper returns original text and logs a warning
- Enhancement modes: `openai`, `gemini`, `both` (OpenAI → Gemini pipeline for combined optimization)

## Storage & Indexing
- Index `resumes.id` and `ats_scores.resume_id` for quick lookups
- Consider TTL or archiving for old resumes in production

## Security & Privacy
- Store all keys in environment variables; do not commit `.env`
- Validate uploaded file types and sizes on the server
- Use HTTPS in production and set strict CORS origins
- Limit logging of full resume content to prevent leakage

## Scalability & Reliability
- LLM calls can be slow—introduce background job queue (e.g., Redis + Celery/RQ) for heavy enhancements
- Add rate limiting for public API endpoints
- Use connection pooling for MongoDB and autoscaling for backend workers

## Extensibility / Future Work
- Job description matching and tailored keyword injection
- Multiple resume templates and styling options
- Support for LinkedIn import and cover letter generation
- User accounts, authentication, and history of versions

