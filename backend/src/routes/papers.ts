import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

// Validation schemas
const createPaperSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  abstract: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  field: z.string().min(1),
  doi: z.string().optional(),
  conferenceId: z.string().optional(),
});

// Helper to transform paper for UI
function transformPaper(paper: any) {
  const reviews = paper.reviews || [];
  const synthesis = paper.synthesis;
  
  // Calculate rating based on review attitudes
  const attitudeScores: Record<string, number> = {
    'POSITIVE': 8,
    'NEUTRAL': 6,
    'NEGATIVE': 4,
  };
  
  const avgScore = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + (attitudeScores[r.attitude] || 5), 0) / reviews.length
    : 0;
  
  // Get decision from synthesis if available
  const decision = synthesis?.recommendation || paper.decision || 'PENDING';
  
  return {
    ...paper,
    date: paper.createdAt.toISOString(),
    description: paper.abstract,
    tag1: paper.keywords?.[0],
    tag2: paper.keywords?.[1],
    rating: avgScore,
    score: avgScore,
    decision: decision.toString().replace(/_/g, ' '),
    status: paper.status,
    conferenceName: paper.metadata?.venue || 'Unknown Conference',
    reviewCount: reviews.length,
    confidence: paper.skillConfidence ? `${Math.round(paper.skillConfidence * 100)}%` : null,
    aiScore: avgScore / 10,
    hasSynthesis: !!synthesis,
  };
}

// List papers with filters
router.get('/', asyncHandler(async (req, res) => {
  const {
    field,
    search,
    page = '1',
    perPage = '20',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const perPageNum = Math.min(100, Math.max(1, parseInt(perPage as string, 10)));
  const skip = (pageNum - 1) * perPageNum;

  const where: any = {};
  
  if (field) {
    where.field = field;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { abstract: { contains: search as string, mode: 'insensitive' } },
      { authors: { hasSome: [search as string] } },
    ];
  }

  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;

  const [papers, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      orderBy,
      skip,
      take: perPageNum,
      include: {
        reviews: true,
        synthesis: true,
      }
    }),
    prisma.paper.count({ where })
  ]);

  res.json({
    success: true,
    data: papers.map(transformPaper),
    meta: {
      page: pageNum,
      perPage: perPageNum,
      total,
      totalPages: Math.ceil(total / perPageNum)
    }
  });
}));

// Get paper by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
      synthesis: true,
    }
  });

  if (!paper) {
    const error = new Error('Paper not found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: transformPaper(paper)
  });
}));

// Create paper
router.post('/', asyncHandler(async (req, res) => {
  const validated = createPaperSchema.parse(req.body);
  
  const paper = await prisma.paper.create({
    data: {
      ...validated,
      pdfUrl: '',
      pdfKey: '',
    }
  });

  res.status(201).json({
    success: true,
    data: paper
  });
}));

// Update paper
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const paper = await prisma.paper.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    data: paper
  });
}));

// Delete paper
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.paper.delete({ where: { id } });

  res.json({
    success: true,
    data: null
  });
}));

// Download PDF
router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const paper = await prisma.paper.findUnique({
    where: { id },
    select: { pdfUrl: true, pdfKey: true, title: true }
  });

  if (!paper || !paper.pdfUrl) {
    const error = new Error('PDF not found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.redirect(paper.pdfUrl);
}));

export { router as papersRouter };
