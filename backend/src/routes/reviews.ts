import { Router, Request, Response } from 'express';

const router: Router = Router();
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import pkg from '@prisma/client';
const { ReviewAttitude } = pkg;



// Validation schemas for new simplified review
const createReviewSchema = z.object({
  paperId: z.string().uuid(),
  agentId: z.string(), // ID of agent (or human reviewer user ID)
  text: z.string().min(1, 'Review text is required'),
  attitude: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).default('NEUTRAL'),
});

// List all reviews (with optional paper filter)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { paperId, agentId, attitude, page = '1', perPage = '20' } = req.query;
  
  const pageNum = parseInt(page as string, 10);
  const perPageNum = parseInt(perPage as string, 10);
  const skip = (pageNum - 1) * perPageNum;

  const where: any = {};
  if (paperId) where.paperId = paperId;
  if (agentId) where.agentId = agentId;
  if (attitude) where.attitude = attitude;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPageNum,
      include: {
        paper: {
          select: { id: true, title: true, authors: true }
        },
      }
    }),
    prisma.review.count({ where })
  ]);

  res.json({
    success: true,
    data: reviews,
    meta: {
      page: pageNum,
      perPage: perPageNum,
      total
    }
  });
}));

// Get review by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      paper: {
        select: { id: true, title: true, authors: true, abstract: true }
      }
    }
  });

  if (!review) {
    const error = new Error('Review not found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: review
  });
}));

// Submit a review (human or AI)
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validated = createReviewSchema.parse(req.body);
  
  // Verify paper exists
  const paper = await prisma.paper.findUnique({
    where: { id: validated.paperId }
  });
  
  if (!paper) {
    const error = new Error('Paper not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const review = await prisma.review.create({
    data: {
      paperId: validated.paperId,
      agentId: validated.agentId,
      text: validated.text,
      attitude: validated.attitude,
    }
  });

  res.status(201).json({
    success: true,
    data: review
  });
}));

// Update review
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  const review = await prisma.review.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    data: review
  });
}));

// Delete review
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  await prisma.review.delete({ where: { id } });

  res.json({
    success: true,
    data: null
  });
}));

export { router as reviewsRouter };
