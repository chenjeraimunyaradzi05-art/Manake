import express from 'express';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from '../../src/server/config/db';
import apiRoutes from '../../src/server/routes';

// Load env vars
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API responses
}));

// CORS configuration - restrict origins
const allowedOrigins = [
  'https://manake.org.zw',
  'https://www.manake.org.zw',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));

// Database connection middleware - ensure connected before handling requests
let dbConnected = false;
app.use(async (_req, _res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      // Continue anyway - individual routes can handle DB errors
    }
  }
  next();
});

// Mount routes at root - Netlify redirects /api/* to /.netlify/functions/api/*
// So a request to /api/stories becomes /.netlify/functions/api/stories
// The :splat captures "stories" and passes it to our handler
app.use('/', apiRoutes);

// Also mount at /api for direct function invocation
app.use('/api', apiRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Export the handler for Netlify Functions
export const handler = serverless(app);
