import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import type { PaperFilters } from '../types/index.js';

const router = Router();

// Validation schemas
const createPaperSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  abstract: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  field: z.string().min(1),
  doi: z.string().optional(),
});

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

  // Build where clause
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

  // Build order by
  const orderBy: any = {};
  if (sortBy === 'relevance' && search) {
    // For relevance, we'll use a simple approach - can be enhanced with full-text search
    orderBy.createdAt = 'desc';
  } else {
    orderBy[sortBy as string] = sortOrder;
  }

  const [papers, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      orderBy,
      skip,
      take: perPageNum,
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    }),
    prisma.paper.count({ where })
  ]);

  res.json({
    success: true,
    data: papers.map(p => ({
      ...p,
      reviewCount: p._count.reviews
    })),
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
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true }
          }
        }
      }
    }
  });

  if (!paper) {
    const error = new Error('Paper not found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: paper
  });
}));

// Create paper (metadata only - PDF uploaded separately)
router.post('/', asyncHandler(async (req, res) => {
  const validated = createPaperSchema.parse(req.body);
  
  // For now, pdfUrl and pdfKey are placeholders - will be updated after file upload
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

// Download PDF (returns signed URL or streams file)
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

  // For now, redirect to the URL
  // In production, this would generate a signed URL or stream from S3/MinIO
  res.redirect(paper.pdfUrl);
}));

export { router as papersRouter };
