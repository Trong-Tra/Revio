import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { papersRouter } from './routes/papers.js';
import { reviewsRouter } from './routes/reviews.js';
import { agentConfigsRouter } from './routes/agent-configs.js';
import { searchRouter } from './routes/search.js';
import { uploadRouter } from './routes/upload.js';
import { qualificationsRouter } from './routes/qualifications.js';
import { authRouter } from './routes/auth.js';
import { conferencesRouter } from './routes/conferences.js';
import synthesisRouter from './routes/synthesis.js';
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS - support multiple origins (Vercel preview deployments)
// Strip trailing slashes from FRONTEND_URL to avoid mismatch
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  frontendUrl,
].filter(Boolean) as string[];

// Also allow all Vercel preview deployments if FRONTEND_URL is set
if (frontendUrl?.includes('vercel.app')) {
  allowedOrigins.push('https://*.vercel.app');
}

// DEBUG: Log allowed origins
console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/papers', papersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/agent-configs', agentConfigsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/qualifications', qualificationsRouter);
app.use('/api/v1/conferences', conferencesRouter);

// Synthesis routes - mounted at papers level to handle :paperId param
app.use('/api/v1/papers/:paperId/synthesis', synthesisRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    type: 'https://api.revio.io/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource was not found'
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/health`);
  console.log(`🤖 TinyFish integration: ${process.env.TINYFISH_API_KEY ? 'enabled' : 'disabled (local fallback)'}`);
});
