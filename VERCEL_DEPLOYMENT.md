# Vercel Deployment Fix Guide

## Problem
The frontend on Vercel cannot reach the backend API because it's trying to connect to `localhost:5000`, which doesn't exist on Vercel.

## Solution: Deploy Backend + Connect to Frontend

### Step 1: Deploy Backend to a Cloud Service

Choose one of these options:

#### Option A: Railway.app (Recommended - simplest)
1. Go to https://railway.app
2. Create account / login
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `top-speed` repository
5. Click the `backend` folder
6. Railway will auto-detect `package.json` and deploy
7. Copy the deployed URL (e.g., `https://top-speed-prod-xxx.railway.app`)

#### Option B: Render.com
1. Go to https://render.com
2. Create account / login
3. Click "New +" → "Web Service"
4. Connect GitHub repo
5. Set root directory to `backend/`
6. Environment: `Node`
7. Build command: `npm install`
8. Start command: `npm start`
9. Deploy and copy the URL

#### Option C: Heroku (free tier deprecated, but still available)
1. Go to https://www.heroku.com
2. Deploy using Heroku CLI or GitHub Integration
3. Copy deployed URL

### Step 2: Set Environment Variable in Vercel

1. Go to https://vercel.com/dashboard
2. Click your `top-speed` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.railway.app/api` (replace with your actual backend URL)
   - Click "Save"

5. Redeploy the frontend:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

### Step 3: Verify Connection

Once deployed, check that:
- Sign up / Login works
- Car listings load
- Configurator functions work
- Admin dashboard (if applicable) is accessible

## Current Status

- ✅ GitHub repo created: https://github.com/benowebk-sys/top-speed
- ✅ Backend running locally on `http://localhost:5000`
- ✅ Frontend ready for Vercel deployment
- ⏳ **Need:** Deploy backend to cloud + set `VITE_API_URL` in Vercel

## Quick Test Locally

To test the full setup locally:
```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend
cd frontend && npm run dev
```

Then visit http://localhost:5173 and test functionality.

---

**Need help?** Let me know which cloud provider you choose and I can guide you through the setup!
