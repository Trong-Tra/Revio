import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

const createConferenceSchema = z.object({
  name: z.string().min(1),
  acronym: z.string().optional(),
  tier: z.enum(['ENTRY', 'STANDARD', 'PREMIUM', 'ELITE']).default('STANDARD'),
  requiredSkills: z.array(z.string()).default([]),
  publisher: z.string().optional(),
  website: z.string().url().optional(),
});

// List all conferences
router.get('/', asyncHandler(async (_req, res) => {
  const conferences = await prisma.conference.findMany({
    orderBy: { name: 'asc' }
  });
  
  res.json({
    success: true,
    data: conferences
  });
}));

// Get conference by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const conference = await prisma.conference.findUnique({
    where: { id }
  });
  
  if (!conference) {
    const error = new Error('Conference not found');
    (error as any).statusCode = 404;
    throw error;
  }
  
  res.json({
    success: true,
    data: conference
  });
}));

// Create conference
router.post('/', asyncHandler(async (req, res) => {
  const data = createConferenceSchema.parse(req.body);
  
  const conference = await prisma.conference.create({
    data
  });
  
  res.status(201).json({
    success: true,
    data: conference
  });
}));

// Update conference
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const conference = await prisma.conference.update({
    where: { id },
    data: req.body
  });
  
  res.json({
    success: true,
    data: conference
  });
}));

// Delete conference
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.conference.delete({ where: { id } });
  
  res.json({
    success: true,
    data: null
  });
}));

export { router as conferencesRouter };
