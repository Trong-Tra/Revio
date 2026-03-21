import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

// Search papers by query
router.get('/', asyncHandler(async (req, res) => {
  const { 
    q, 
    field, 
    sort = 'relevance',
    page = '1', 
    perPage = '20' 
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const perPageNum = Math.min(100, Math.max(1, parseInt(perPage as string, 10)));
  const skip = (pageNum - 1) * perPageNum;

  // Build search conditions
  const where: any = {};
  
  if (q) {
    const query = q as string;
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { abstract: { contains: query, mode: 'insensitive' } },
      { keywords: { hasSome: query.split(' ') } },
      { authors: { hasSome: [query] } },
    ];
  }

  if (field) {
    where.field = field;
  }

  // Determine sort order
  let orderBy: any = {};
  switch (sort) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'title':
      orderBy = { title: 'asc' };
      break;
    default: // relevance - default to newest for now
      orderBy = { createdAt: 'desc' };
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
        },
        reviews: {
          where: { reviewerType: 'AI' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            confidenceScore: true,
            content: true,
          }
        }
      }
    }),
    prisma.paper.count({ where })
  ]);

  // Transform results to include AI confidence score
  const results = papers.map(p => {
    const aiReview = p.reviews[0];
    return {
      id: p.id,
      title: p.title,
      authors: p.authors,
      abstract: p.abstract,
      keywords: p.keywords,
      field: p.field,
      createdAt: p.createdAt,
      reviewCount: p._count.reviews,
      confidence: aiReview?.confidenceScore 
        ? Math.round(aiReview.confidenceScore * 100) + '%'
        : null,
      aiScore: aiReview?.content && typeof aiReview.content === 'object'
        ? (aiReview.content as any).overallScore
        : null,
    };
  });

  res.json({
    success: true,
    data: results,
    meta: {
      page: pageNum,
      perPage: perPageNum,
      total,
      totalPages: Math.ceil(total / perPageNum),
      query: q || null,
      field: field || null,
    }
  });
}));

// Get available fields
router.get('/fields', asyncHandler(async (_req, res) => {
  const fields = await prisma.paper.groupBy({
    by: ['field'],
    _count: { field: true },
    orderBy: { _count: { field: 'desc' } }
  });

  res.json({
    success: true,
    data: fields.map(f => ({
      name: f.field,
      count: f._count.field
    }))
  });
}));

// Get trending keywords
router.get('/keywords', asyncHandler(async (req, res) => {
  const { limit = '20' } = req.query;
  const limitNum = Math.min(100, parseInt(limit as string, 10));

  // Get all keywords from recent papers
  const recentPapers = await prisma.paper.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { keywords: true }
  });

  // Count keyword frequency
  const keywordCounts = new Map<string, number>();
  recentPapers.forEach(p => {
    p.keywords.forEach(k => {
      keywordCounts.set(k, (keywordCounts.get(k) || 0) + 1);
    });
  });

  // Sort and limit
  const trending = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limitNum)
    .map(([keyword, count]) => ({ keyword, count }));

  res.json({
    success: true,
    data: trending
  });
}));

export { router as searchRouter };
