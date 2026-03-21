import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

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
  
  // Get final result from synthesis or paper
  const finalResult = synthesis?.recommendation || paper.finalResult || 'PENDING';
  
  return {
    ...paper,
    date: paper.createdAt.toISOString(),
    description: paper.abstract,
    tag1: paper.keywords?.[0],
    tag2: paper.keywords?.[1],
    finalResult: finalResult.toString().replace(/_/g, ' '),
    reviewCount: reviews.length,
    confidence: paper.skillConfidence ? `${Math.round(paper.skillConfidence * 100)}%` : null,
    hasSynthesis: !!synthesis,
  };
}

// Get current user's papers (requires authentication) - MUST be before /:id
router.get('/my-papers', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.userId!;
  
  const papers = await prisma.paper.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviews: true,
      synthesis: true,
    }
  });
  
  res.json({
    success: true,
    data: papers.map(transformPaper),
    meta: { count: papers.length }
  });
}));

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

// Create paper (requires authentication)
router.post('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const validated = createPaperSchema.parse(req.body);
  
  const paper = await prisma.paper.create({
    data: {
      ...validated,
      pdfUrl: '',
      pdfKey: '',
      userId: req.userId!,
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

// Delete paper (only own papers)
router.delete('/:id', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const paperId = req.params.id as string;
  const userId = req.userId!;
  
  // Check if paper exists and belongs to user
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    select: { userId: true, pdfKey: true }
  });
  
  if (!paper) {
    const error = new Error('Paper not found');
    (error as any).statusCode = 404;
    throw error;
  }
  
  if (paper.userId !== userId) {
    const error = new Error('You can only delete your own papers');
    (error as any).statusCode = 403;
    throw error;
  }
  
  // Delete PDF from storage if exists
  if (paper.pdfKey) {
    try {
      const { storage } = await import('../lib/storage.js');
      await storage.deleteFile(paper.pdfKey);
    } catch (storageError) {
      console.warn(`[Delete Paper] Could not delete PDF file: ${paper.pdfKey}`, storageError);
    }
  }
  
  // Delete paper from database
  await prisma.paper.delete({ where: { id: paperId } });

  res.json({
    success: true,
    data: null,
    message: 'Paper deleted successfully'
  });
}));

// Download PDF - use signed URL for access
router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const paper = await prisma.paper.findUnique({
    where: { id },
    select: { pdfUrl: true, pdfKey: true, title: true }
  });

  if (!paper || !paper.pdfKey) {
    const error = new Error('PDF not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Generate a signed URL for direct access
  const { storage } = await import('../lib/storage.js');
  const signedUrl = await storage.getSignedDownloadUrl(paper.pdfKey, 3600);
  
  res.redirect(signedUrl);
}));

export { router as papersRouter };
