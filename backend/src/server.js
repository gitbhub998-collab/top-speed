import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorHandler } from './middleware/auth.js';
import { publicSubmissionRateLimit, securityHeaders } from './middleware/security.js';

import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import modificationRoutes from './routes/modificationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import configuratorRoutes from './routes/configuratorRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import packageRoutes from './routes/packageRoutes.js';

import { isSupabaseConfigured } from './config/supabase.js';

const app = express();
const PORT = Number(process.env.BACKEND_PORT || 5750);
const NODE_ENV = process.env.NODE_ENV || 'development';
app.set('trust proxy', 1);

// Parse configured origins from environment
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, '').toLowerCase())
  .filter(Boolean);

const productionOrigins = [
  'https://top-speed-frontend-nine.vercel.app',
  'https://top-speed-bm.vercel.app',
];

// Local development origins
const localOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5759',
  'http://localhost:3000',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalized = origin.toLowerCase().replace(/\/+$/, '');

  // Check local origins
  if (NODE_ENV !== 'production' && localOrigins.includes(normalized)) {
    return true;
  }

  // Check configured origins
  if ([...configuredOrigins, ...productionOrigins].includes(normalized)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn(` CORS blocked origin: ${origin}`);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Bootstrap-Secret'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

// Middleware
app.use(securityHeaders);
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: false }));

// CORS Configuration for Vercel and development
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    name: 'TOP SPEED API', 
    status: 'Backend is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend is running', 
    databaseConfigured: isSupabaseConfigured,
    emailConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    distributedRateLimitConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/modifications', modificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/configurator', configuratorRoutes);
app.use('/api/service', publicSubmissionRateLimit, serviceRoutes);
app.use('/api/packages', packageRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.path} does not exist`
  });
});

// Server startup for local development
if (NODE_ENV !== 'production') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(` TOP SPEED Backend running on http://localhost:${PORT}`);
    console.log(` API available at http://localhost:${PORT}/api`);
    console.log(` CORS enabled for: ${configuredOrigins.join(', ') || 'localhost only'}`);
  });

  server.on('error', (error) => {
    console.error(' Failed to start backend server:', error);
    process.exit(1);
  });
}

// Export the Express app for Vercel's Node.js runtime
export default app;
