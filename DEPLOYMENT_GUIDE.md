# 🚀 Deployment Guide - AI-Powered Resume Builder

## Pre-Deployment Checklist

✅ MongoDB Atlas configured and running
✅ API keys (OpenAI & Gemini) ready
✅ Application tested locally
✅ Git repository initialized

---

## 📦 Part 1: Deploy Backend (Render)

### Step 1: Prepare Backend for Deployment

1. Make sure `requirements.txt` is up to date
2. Verify `render.yaml` is in the backend folder
3. Push your code to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up / Log in (use GitHub)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** `ai-resume-builder-backend`
   - **Region:** Oregon (Free)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

6. **Add Environment Variables:**
   - `MONGO_URL` = `your MongoDB Atlas connection string`
   - `DB_NAME` = `resume_builder`
   - `CORS_ORIGINS` = `*`
   - `OPENAI_API_KEY` = `your OpenAI key`
   - `GEMINI_API_KEY` = `your Gemini key`

7. Click **"Create Web Service"**
8. Wait for deployment (5-10 minutes)
9. **Copy your backend URL** (e.g., `https://ai-resume-builder-backend.onrender.com`)

---

## 🌐 Part 2: Deploy Frontend (Netlify)

### Step 1: Update Frontend Configuration

1. Update `frontend/.env`:
```bash
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

2. Update `frontend/netlify.toml`:
   - Replace `REACT_APP_BACKEND_URL` with your actual Render backend URL

### Step 2: Deploy to Netlify

**Option A: Netlify CLI**
```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Option B: Netlify Dashboard**
1. Go to https://netlify.com
2. Sign up / Log in
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect GitHub repository
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
6. Add environment variable:
   - `REACT_APP_BACKEND_URL` = Your Render backend URL
7. Click **"Deploy site"**

---

## 🔧 Part 3: Update CORS (Important!)

After deploying, update your backend's CORS settings:

1. Get your Netlify URL (e.g., `https://your-app.netlify.app`)
2. In Render dashboard, update `CORS_ORIGINS` environment variable:
   ```
   https://your-app.netlify.app,http://localhost:3000
   ```
3. Restart the backend service

---

## ✅ Part 4: Verify Deployment

1. Visit your Netlify URL
2. Try uploading a resume
3. Check if data saves to MongoDB Atlas
4. Test AI enhancement features

---

## 🔐 MongoDB Atlas - Add Render IP

MongoDB Atlas may need to whitelist Render's IPs:

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

---

## 📊 Monitoring

**Backend Logs:** Check Render dashboard → Your service → Logs
**Frontend Logs:** Check Netlify dashboard → Your site → Deploys → Deploy log

---

## 🎉 You're Done!

Your application is now live and accessible worldwide! 

**Share your URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend API: `https://your-backend.onrender.com/api/`

---

## 💡 Tips

- **Free Tier Limitations:**
  - Render: May sleep after 15 min of inactivity (takes ~1 min to wake)
  - Netlify: 100GB bandwidth/month
  - MongoDB Atlas: 512MB storage

- **Custom Domain:** Both Netlify and Render support custom domains for free!

- **Updates:** 
  - Just push to GitHub
  - Both services auto-deploy on new commits
