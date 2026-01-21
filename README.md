# AI-Powered Resume Builder

An intelligent resume builder application that helps users create, enhance, and optimize their resumes using AI technology.

## Features

- 📄 **Resume Upload**: Support for PDF and DOCX file formats
- ✍️ **Manual Resume Creation**: Build your resume from scratch with guided forms
- 🤖 **AI Enhancement**: Enhance your resume using OpenAI and Google Gemini
- 📊 **ATS Score Analysis**: Get instant feedback on how your resume performs with ATS systems
- 📥 **Export Options**: Download your resume in PDF or DOCX format
- 🎨 **Modern UI**: Clean and responsive design built with React and Tailwind CSS

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - Database for storing resumes and scores
- **OpenAI & Google Gemini** - AI models for resume enhancement
- **PyPDF2 & python-docx** - Document processing
- **ReportLab** - PDF generation

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Navigation
- **Radix UI** - Accessible component primitives

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (running on localhost:27017)

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd AI-Powered-Resume-Builder
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file with:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=resume_builder
# CORS_ORIGINS=*
# EMERGENT_LLM_KEY=your_api_key_here

# Run the backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with:
# REACT_APP_BACKEND_URL=http://localhost:8000
# WDS_SOCKET_PORT=443
# ENABLE_HEALTH_CHECK=false

# Run the frontend server
npm start
```

## Usage

1. **Start MongoDB** on your local machine
2. **Run the backend server** (port 8000)
3. **Run the frontend app** (port 3000)
4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/resume/upload` - Upload resume file
- `POST /api/resume/manual` - Create resume manually
- `POST /api/resume/enhance` - Enhance resume with AI
- `GET /api/resume/{resume_id}` - Get resume by ID
- `POST /api/resume/generate/{resume_id}` - Generate PDF/DOCX

## Project Structure

```
AI-Powered-Resume-Builder/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── llm_helper.py      # AI enhancement logic
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend configuration
├── frontend/
│   ├── src/              # React source code
│   ├── public/           # Static files
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend configuration
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
