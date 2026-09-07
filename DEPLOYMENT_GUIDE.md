# 🚀 Deployment Guide - Top Speed on Vercel

## Prerequisites
- GitHub account with repository access
- Vercel account (free tier)
- Supabase account and project
- Gmail account for SMTP (optional but recommended)

---

## 📋 Step 1: Set Up Vercel Projects

### A. Create Backend Project
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import the GitHub repository `benowebk-sys/Top-Speed1`
4. Choose **Framework**: None (for Node.js backend)
5. Set **Root Directory**: `backend`
6. Click **Deploy**

### B. Create Frontend Project
1. In Vercel dashboard, click **Add New** → **Project**
2. Import the same GitHub repository
3. Choose **Framework**: Vite
4. Set **Root Directory**: `frontend`
5. **Do NOT click Deploy yet** - we need to set environment variables first

---

## 🔐 Step 2: Configure Environment Variables

### Backend Environment Variables (in Vercel Dashboard)

Go to your backend project → Settings → Environment Variables

Add these variables:

```
BACKEND_PORT=3000
JWT_SECRET=[Generate a strong random string - use: openssl rand -base64 32]
API_NINJAS_KEY=[Get from https://api-ninjas.com]
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=[Gmail App Password - see setup below]
EMAIL_FROM=TOP SPEED <your_email@gmail.com>
TEAM_EMAIL=your_team_email@gmail.com

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=[From Supabase dashboard]
SUPABASE_SERVICE_ROLE_KEY=[From Supabase dashboard]
```

### Frontend Environment Variables (in Vercel Dashboard)

Go to your frontend project → Settings → Environment Variables

Add these variables:

```
VITE_API_URL=https://[YOUR-BACKEND-VERCEL-DOMAIN]/api
VITE_APP_NAME=Top Speed
VITE_ADMIN_EMAILS=admin@topspeed.com
```

---

## 📧 Step 3: Setup Gmail SMTP (for Email Functionality)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Click **App passwords** (appears only if 2FA is enabled)
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a 16-character password
6. Use this password as `SMTP_PASS` in your environment variables
7. Enable "Less secure app access" if needed

---

## 🗄️ Step 4: Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy:
   - `Project URL` → Use as `SUPABASE_URL`
   - `anon public` key → Use as `SUPABASE_ANON_KEY`
   - `service_role` secret → Use as `SUPABASE_SERVICE_ROLE_KEY`
4. Create necessary tables in Supabase (run migrations if available)

---

## 🎯 Step 5: Deploy to Vercel

### Backend Deployment
1. Go to your backend Vercel project
2. Click **Deployments** → **Redeploy**
3. Select "Use existing Environment Variables"
4. Wait for deployment to complete
5. Note your backend URL (e.g., `https://top-speed1-backend.vercel.app`)

### Frontend Deployment
1. Update `VITE_API_URL` in frontend environment variables with your backend URL
2. Go to your frontend Vercel project
3. Click **Deployments** → **Redeploy**
4. Wait for deployment to complete
5. Your app will be live!

---

## ✅ Step 6: Verify Deployment

### Check Backend Health
```bash
curl https://[YOUR-BACKEND-URL]/api/health
```

Expected response:
```json
{
  "status": "Backend is running",
  "databaseConfigured": true,
  "environment": "production"
}
```

### Test Frontend
1. Visit your frontend URL
2. Test authentication (signup/login)
3. Verify API calls are working
4. Check browser console for any errors

---

## 🛠️ Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend includes your frontend domain
- Check that frontend is using correct `VITE_API_URL`

### WebSocket Connection Failed
- WebSocket on Vercel functions requires specific configuration
- Consider using REST API polling as alternative

### Email Not Sending
- Verify Gmail SMTP credentials
- Check spam/trash folders
- Ensure app passwords is used, not regular password
- Enable "Less secure app access" if needed

### Supabase Connection Failed
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Ensure required tables exist

### Database Not Found
- Set up Supabase tables before deployment
- Run any pending migrations

---

## 📱 Environment Variable Reference

### Production Deployment
Set these in Vercel Dashboard:
- Frontend: `/frontend` directory
- Backend: `/backend` directory
- Use environment variables from Step 2

### Local Development
Create `.env.local` files:

**backend/.env.local**
```
BACKEND_PORT=5750
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
# ... other variables
```

**frontend/.env.local**
```
VITE_API_URL=http://localhost:5750/api
VITE_APP_NAME=Top Speed
VITE_ADMIN_EMAILS=admin@example.com
```

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you:
1. Push to `main` branch
2. Create a pull request
3. Use Vercel CLI: `vercel --prod`

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs: Project → Deployments → View Logs
2. Check browser console for frontend errors
3. Check backend logs for API errors
4. Verify all environment variables are set correctly

---

## Security Checklist

- ✅ Never commit `.env` files
- ✅ Use strong `JWT_SECRET` (minimum 32 characters)
- ✅ Use Gmail App Password, not account password
- ✅ Enable 2FA on Gmail account
- ✅ Keep Supabase keys secret
- ✅ Regularly rotate sensitive credentials
- ✅ Use HTTPS for all URLs
- ✅ Verify CORS origins are correct

---

**Happy Deploying! 🚀**
