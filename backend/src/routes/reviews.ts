import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import type { ReviewContent } from '../types/index.js';

const router = Router();

// Validation schemas
const createReviewSchema = z.object({
  paperId: z.string().uuid(),
  content: z.object({
    summary: z.string(),
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    methodologyAnalysis: z.string().optional(),
    noveltyAssessment: z.string().optional(),
    overallScore: z.number().min(1).max(10).optional(),
    confidence: z.number().min(0).max(1).optional(),
  }),
  isAccepted: z.boolean().optional(),
});

const createAIReviewSchema = z.object({
  content: z.object({
    summary: z.string(),
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    findings: z.array(z.object({
      type: z.string(),
      status: z.string(),
      confidence: z.number(),
    })).optional(),
    overallScore: z.number().optional(),
    confidence: z.number().optional(),
  }),
  confidenceScore: z.number().optional(),
});

// List all reviews (with optional paper filter)
router.get('/', asyncHandler(async (req, res) => {
  const { paperId, type, page = '1', perPage = '20' } = req.query;
  
  const pageNum = parseInt(page as string, 10);
  const perPageNum = parseInt(perPage as string, 10);
  const skip = (pageNum - 1) * perPageNum;

  const where: any = {};
  if (paperId) where.paperId = paperId;
  if (type) where.reviewerType = type;

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
        reviewer: {
          select: { id: true, name: true, avatarUrl: true }
        }
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
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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

// Submit human review
router.post('/', asyncHandler(async (req, res) => {
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
      reviewerType: 'HUMAN',
      content: validated.content,
      isAccepted: validated.isAccepted,
      confidenceScore: validated.content.confidence,
    }
  });

  res.status(201).json({
    success: true,
    data: review
  });
}));

// Submit AI review (triggered by agent-worker)
router.post('/ai', asyncHandler(async (req, res) => {
  const { paperId, ...validated } = createAIReviewSchema.parse(req.body);
  
  // Verify paper exists
  const paper = await prisma.paper.findUnique({
    where: { id: paperId }
  });
  
  if (!paper) {
    const error = new Error('Paper not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const review = await prisma.review.create({
    data: {
      paperId,
      reviewerType: 'AI',
      content: validated.content,
      confidenceScore: validated.confidenceScore || validated.content.confidence,
    }
  });

  res.status(201).json({
    success: true,
    data: review
  });
}));

// Update review
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.review.delete({ where: { id } });

  res.json({
    success: true,
    data: null
  });
}));

export { router as reviewsRouter };
