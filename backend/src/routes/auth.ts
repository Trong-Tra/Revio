import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import crypto from 'crypto';

const router = Router();

// Helper to hash password (simple, for demo - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate JWT token (simple version)
function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    userId, 
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'revio-secret')
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  affiliation: z.string().optional(),
  orcidId: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Sign up
router.post('/signup', asyncHandler(async (req, res) => {
  const { name, email, password, affiliation, orcidId } = signUpSchema.parse(req.body);
  
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existing) {
    const error = new Error('Email already registered');
    (error as any).statusCode = 400;
    throw error;
  }
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      affiliation,
      orcidId,
    }
  });
  
  const token = generateToken(user.id);
  
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        affiliation: user.affiliation,
        orcidId: user.orcidId,
        role: user.role,
      },
      token
    }
  });
}));

// Sign in
router.post('/signin', asyncHandler(async (req, res) => {
  const { email, password } = signInSchema.parse(req.body);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user || user.passwordHash !== hashPassword(password)) {
    const error = new Error('Invalid email or password');
    (error as any).statusCode = 401;
    throw error;
  }
  
  const token = generateToken(user.id);
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        affiliation: user.affiliation,
        orcidId: user.orcidId,
        role: user.role,
      },
      token
    }
  });
}));

// Sign out
router.post('/signout', asyncHandler(async (_req, res) => {
  // In a real app, invalidate token
  res.json({
    success: true,
    data: null
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    const error = new Error('Not authenticated');
    (error as any).statusCode = 401;
    throw error;
  }
  
  // Decode token
  const parts = token.split('.');
  if (parts.length !== 3) {
    const error = new Error('Invalid token');
    (error as any).statusCode = 401;
    throw error;
  }
  
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  
  if (payload.exp < Date.now()) {
    const error = new Error('Token expired');
    (error as any).statusCode = 401;
    throw error;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      affiliation: true,
      orcidId: true,
      role: true,
      avatarUrl: true,
    }
  });
  
  if (!user) {
    const error = new Error('User not found');
    (error as any).statusCode = 404;
    throw error;
  }
  
  res.json({
    success: true,
    data: user
  });
}));

// Update profile
router.patch('/profile', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    const error = new Error('Not authenticated');
    (error as any).statusCode = 401;
    throw error;
  }
  
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  
  const allowedUpdates = ['name', 'affiliation', 'orcidId', 'bio'];
  const updates: any = {};
  
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }
  
  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      affiliation: true,
      orcidId: true,
      role: true,
      avatarUrl: true,
    }
  });
  
  res.json({
    success: true,
    data: user
  });
}));

export { router as authRouter };
