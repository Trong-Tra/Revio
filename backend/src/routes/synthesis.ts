/**
 * Review Synthesis Routes
 * 
 * Provides endpoints for synthesizing council reviews into a unified decision.
 * Uses TinyFish AI to extract insights and form recommendations.
 * 
 * Routes:
 * POST /api/v1/papers/:paperId/synthesis - Generate synthesis
 * GET /api/v1/papers/:paperId/synthesis - Get existing synthesis
 */

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { synthesizeReviews } from '../services/synthesis.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router({ mergeParams: true });

/**
 * POST /api/v1/papers/:paperId/synthesis
 * Synthesize all reviews for a paper into a unified decision
 */
router.post('/', asyncHandler(async (req, res) => {
  const { paperId } = req.params;
  const { forceTinyFish = true } = req.body;

  // Get paper with reviews
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    include: { reviews: true },
  });

  if (!paper) {
    return res.status(404).json({
      success: false,
      error: 'Paper not found',
    });
  }

  if (paper.reviews.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No reviews to synthesize',
    });
  }

  // Prepare input for synthesis
  const synthesisInput = {
    paperTitle: paper.title,
    paperAbstract: paper.abstract,
    reviews: paper.reviews.map(r => ({
      agentId: r.agentId,
      text: r.text,
      attitude: r.attitude,
    })),
  };

  console.log(`[Synthesis] Generating for paper ${paperId} with ${paper.reviews.length} reviews`);
  console.log(`[Synthesis] TinyFish API Key present: ${!!process.env.TINYFISH_API_KEY}`);

  // Perform synthesis
  const result = await synthesizeReviews(synthesisInput);

  // Save synthesis to database
  const synthesis = await prisma.reviewSynthesis.upsert({
    where: { paperId },
    create: {
      paperId,
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendation: result.recommendation,
      confidence: result.confidence,
      reviewCount: paper.reviews.length,
      councilIds: paper.reviews.map(r => r.agentId),
    },
    update: {
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendation: result.recommendation,
      confidence: result.confidence,
      reviewCount: paper.reviews.length,
      councilIds: paper.reviews.map(r => r.agentId),
    },
  });

  res.json({
    success: true,
    data: synthesis,
    meta: {
      source: result.summary.includes('Based on') && result.summary.includes('council reviews') 
        ? 'local' 
        : 'tinyfish',
    }
  });
}));

/**
 * GET /api/v1/papers/:paperId/synthesis
 * Get the synthesis for a paper (if it exists)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { paperId } = req.params;

  const synthesis = await prisma.reviewSynthesis.findUnique({
    where: { paperId },
  });

  if (!synthesis) {
    return res.status(404).json({
      success: false,
      error: 'No synthesis found for this paper. Generate one first.',
    });
  }

  res.json({
    success: true,
    data: synthesis,
  });
}));

export default router;
