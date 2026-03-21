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
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/papers', papersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/agent-configs', agentConfigsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/qualifications', qualificationsRouter);

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
});
