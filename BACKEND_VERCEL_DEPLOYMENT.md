# Deploying Backend to Vercel

## Why Backend on Vercel?

Vercel now supports serverless Node.js applications, making it perfect for deploying your Express backend without managing servers. The `vercel.json` configuration has been set up for you.

## Prerequisites

1. **Vercel Account** - Connected to your GitHub
2. **MongoDB Atlas** - Cloud database (free tier available)
3. **GitHub Repository** - Already pushed (https://github.com/benowebk-sys/top-speed)

## Step 1: Set Up MongoDB Atlas (If Not Already Done)

### Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Click "Create a deployment" → Choose "Free" tier
4. Select your region (close to your users)
5. Create username and password for database access
6. Click "Create Cluster"

### Get Connection String

1. Once cluster is created, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
4. Replace `<password>` and `<database>` with your values

### Whitelist Vercel IPs

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allows all IPs for serverless)
4. Click "Confirm"

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel Website (Recommended for Testing)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your `top-speed` GitHub repository
4. **Override Settings:**
   - Root Directory: `backend`
   - Framework: `Other`
   - Build Command: (leave default)
   - Output Directory: (leave blank)
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root, or specify --cwd backend)
vercel --cwd backend --prod
```

## Step 3: Add Environment Variables

### In Vercel Dashboard

1. Go to your project → **Settings**
2. Click **Environment Variables**
3. Add these variables (get values from your `.env` file):

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority` |
| `JWT_SECRET` | Your JWT secret key | `your-super-secret-key-123` |
| `SMTP_HOST` | Gmail SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Gmail SMTP port (`465` or `587`) | `587` |
| `SMTP_USER` | Gmail address for notifications | `your-email@gmail.com` |
| `SMTP_PASS` | Gmail app password (not regular password) | `xxxx xxxx xxxx xxxx` |
| `EMAIL_FROM` | Sender address and display name | `TOP SPEED <your-email@gmail.com>` |
| `TEAM_EMAIL` | Team inbox for service requests | `your-team@gmail.com` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://top-speed-frontend.vercel.app` |
| `NODE_ENV` | Production environment | `production` |

### How to Get Gmail App Password

1. Enable 2-Factor Authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" → "Windows Computer"
4. Copy the generated password (16 characters)
5. Paste in `SMTP_PASS` field. Spaces are removed automatically.

## Step 4: Redeploy After Adding Environment Variables

1. After adding env vars, go to **Deployments**
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

## Step 5: Get Your Backend URL

Once deployed, you'll see a URL like:
```
https://top-speed-backend-abc123.vercel.app
```

This is your **Backend API URL**.

## Step 6: Update Frontend

1. Go to your **Frontend Project** on Vercel
2. Go to **Settings** → **Environment Variables**
3. Add/Update:
   - `VITE_API_URL` = `https://top-speed-backend-abc123.vercel.app/api`
4. **Redeploy** the frontend

## Step 7: Test the Connection

1. Open your frontend URL: `https://top-speed-frontend.vercel.app`
2. Try to:
   - Sign up with new account
   - Login with existing account
   - View car listings
   - Use the configurator
3. Check browser console (F12) for any errors

## Troubleshooting

### Deployment Failed
- Check build logs in Vercel dashboard
- Ensure `Node.js` version is 18+
- Verify all dependencies are in `package.json`

### API Connection Fails
- Check `VITE_API_URL` in frontend env vars
- Verify `FRONTEND_URL` in backend env vars
- Check browser console for CORS errors

### Database Connection Error
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas whitelist includes `0.0.0.0/0`
- Ensure database exists in MongoDB

### Email Not Working
- Verify `SMTP_USER` and `SMTP_PASS`
- Ensure Gmail app password (not regular password)
- Check 2FA is enabled on Gmail account

### CORS Issues

If you see "CORS policy" errors:
1. Backend already allows all Vercel domains
2. Check frontend `VITE_API_URL` ends with `/api`
3. Ensure backend is running (check health endpoint)

Test health endpoint:
```bash
curl https://your-backend-url.vercel.app/api/health
```
Should return:
```json
{"status":"Backend is running"}
```

## Performance Tips

1. **Cold Starts**: First request takes longer. Use "/api/health" to warm up
2. **Database Connection**: MongoDB connection pooling is automatic
3. **Caching**: Add caching headers for images and static files
4. **Rate Limiting**: Consider adding rate limiting for free tier

## Monitoring

View logs in Vercel:
1. Go to project → **Deployments**
2. Click your deployment
3. View **Logs**

## Next Steps

Once backend is live on Vercel:
1. ✅ Test all API endpoints
2. ✅ Monitor error logs
3. ✅ Set up uptime monitoring (optional)
4. ✅ Configure CI/CD for auto-deployment

---

**Need more help?** Check the `README.md` in the backend folder or the main `VERCEL_DEPLOYMENT.md` file.
