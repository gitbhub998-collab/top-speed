# TOP SPEED Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Git repository

### Step 1: Deploy to Vercel
```bash
npm install -g vercel
vercel login
cd frontend
vercel
```

### Step 2: Environment Variables
In Vercel Dashboard:
- Set `VITE_API_URL=https://topspeed-backend.onrender.com/api`

### Step 3: Deploy
```bash
vercel --prod
```

Your frontend will be live at: `https://topspeed-frontend.vercel.app`

---

## Backend Deployment (Render)

### Prerequisites
- Render account
- MongoDB Atlas account (for database)

### Step 1: Prepare MongoDB
1. Create MongoDB Atlas cluster
2. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/topspeed`

### Step 2: Create Web Service on Render
1. Connect your GitHub repository
2. Select backend folder
3. Set environment variables:
   - `DATABASE_URL`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a strong secret
   - `API_NINJAS_KEY`: Get from https://api-ninjas.com
   - `BACKEND_PORT`: 5000
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your Vercel frontend URL

### Step 3: Deploy
Service will auto-deploy on git push to main branch

Your backend will be live at: `https://topspeed-backend.onrender.com`

---

## Database Setup (MongoDB)

### Create Admin User
```bash
# Connect to your MongoDB
mongo "mongodb+srv://username:password@cluster.mongodb.net/topspeed"

# Create initial admin
db.users.insertOne({
  email: "admin@topspeed.com",
  password: "hashed_password_here",
  role: "admin",
  isActive: true
})
```

**Note:** Passwords are auto-hashed on the backend when created through the API.

---

## API Keys Required

### 1. API-Ninjas Cars API
- Sign up: https://api-ninjas.com
- Get API key from dashboard
- Free tier: 50 requests/month
- Set as `API_NINJAS_KEY` environment variable

### 2. JWT Secret
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Use as `JWT_SECRET`

---

## Testing Deployment

### Frontend Health Check
```bash
curl https://topspeed-frontend.vercel.app/
```

### Backend Health Check
```bash
curl https://topspeed-backend.onrender.com/api/health
```

### Test API Endpoint
```bash
curl https://topspeed-backend.onrender.com/api/cars
```

---

## Admin Login (Production)

1. Go to `/login`
2. Use credentials created during setup
3. Access admin dashboard at `/admin`

---

## Monitoring & Logs

### Vercel Logs
Dashboard → Project → Deployments → View Logs

### Render Logs
Dashboard → Service → Logs tab

### MongoDB Monitoring
MongoDB Atlas → Monitoring → Metrics

---

## Production Optimization

### Frontend
- Vercel auto-optimizes builds
- CDN enabled by default
- Environment variables secured

### Backend
- Connection pooling enabled
- Error handling in place
- Rate limiting recommended (add later)

---

## Troubleshooting

### CORS Issues
- Check `FRONTEND_URL` matches your Vercel domain
- Backend CORS config in `server.js`

### Database Connection
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas

### API Key Issues
- Verify API-Ninjas key validity
- Check API limits not exceeded

---

## Support & Documentation

- API Docs: See backend README
- Frontend Components: See frontend source
- Database Models: See backend models/

---

## Next Steps

1. Implement Stripe for payments (optional)
2. Add image upload to S3 (optional)
3. Setup analytics tracking
4. Configure email notifications
5. Add rate limiting to API

---

Built with production-grade architecture for enterprise automotive clients.
