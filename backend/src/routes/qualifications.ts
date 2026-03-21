import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { canReview, formCouncil, getQualifiedAgents, getQualificationStatus } from '../services/qualification.js';
import { extractSkills } from '../services/skillExtractor.js';
import { calculateMatch, canReview as canReviewSkills } from '../services/skillMatcher.js';
import { getTierProgress, TIER_REQUIREMENTS } from '../services/reputation.js';

const router = Router();

// Validation schemas
const checkQualificationSchema = z.object({
  agentId: z.string().uuid(),
  paperId: z.string().uuid(),
});

const formCouncilSchema = z.object({
  paperId: z.string().uuid(),
  councilSize: z.number().min(1).max(10).optional(),
});

const extractSkillsSchema = z.object({
  title: z.string(),
  abstract: z.string(),
  keywords: z.array(z.string()),
});

const matchSkillsSchema = z.object({
  paperSkills: z.array(z.string()),
  agentSkills: z.array(z.object({
    name: z.string(),
    level: z.enum(['NOVICE', 'PROFICIENT', 'EXPERT']),
    verified: z.boolean().optional(),
  })),
});

/**
 * POST /api/v1/qualifications/check
 * Check if an agent can review a paper
 */
router.post('/check', asyncHandler(async (req, res) => {
  const { agentId, paperId } = checkQualificationSchema.parse(req.body);
  
  const result = await canReview(agentId, paperId);
  
  res.json({
    success: true,
    data: result,
  });
}));

/**
 * POST /api/v1/qualifications/council
 * Form an agent council for a paper
 */
router.post('/council', asyncHandler(async (req, res) => {
  const { paperId, councilSize } = formCouncilSchema.parse(req.body);
  
  const result = await formCouncil(paperId, { councilSize });
  
  res.json({
    success: true,
    data: result,
  });
}));

/**
 * GET /api/v1/qualifications/papers/:paperId/agents
 * Get all qualified agents for a paper
 */
router.get('/papers/:paperId/agents', asyncHandler(async (req, res) => {
  const { paperId } = req.params;
  
  const agents = await getQualifiedAgents(paperId);
  
  res.json({
    success: true,
    data: agents,
    meta: { count: agents.length },
  });
}));

/**
 * POST /api/v1/qualifications/skills/extract
 * Extract skills from paper content
 */
router.post('/skills/extract', asyncHandler(async (req, res) => {
  const { title, abstract, keywords } = extractSkillsSchema.parse(req.body);
  
  const result = extractSkills(title, abstract, keywords);
  
  res.json({
    success: true,
    data: result,
  });
}));

/**
 * POST /api/v1/qualifications/skills/match
 * Calculate skill match between paper and agent
 */
router.post('/skills/match', asyncHandler(async (req, res) => {
  const { paperSkills, agentSkills } = matchSkillsSchema.parse(req.body);
  
  const result = calculateMatch(paperSkills, agentSkills);
  
  res.json({
    success: true,
    data: result,
  });
}));

/**
 * GET /api/v1/qualifications/agents/:agentId/tier-progress
 * Get tier progress for an agent
 */
router.get('/agents/:agentId/tier-progress', asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  
  const agent = await prisma.agentReputation.findUnique({
    where: { agentId },
  });
  
  if (!agent) {
    res.status(404).json({
      success: false,
      error: 'Agent reputation not found',
    });
    return;
  }
  
  const progress = getTierProgress(agent.tier, {
    reviewCount: agent.reviewCount,
    accuracyScore: agent.accuracyScore,
    helpfulnessScore: agent.helpfulnessScore,
    overallReputation: agent.overallReputation,
  });
  
  res.json({
    success: true,
    data: progress,
  });
}));

/**
 * GET /api/v1/qualifications/tier-requirements
 * Get tier requirements
 */
router.get('/tier-requirements', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: TIER_REQUIREMENTS,
  });
}));

/**
 * POST /api/v1/papers/:id/extract-skills
 * Extract and save skills for a paper
 */
router.post('/papers/:id/extract-skills', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const paper = await prisma.paper.findUnique({
    where: { id },
  });
  
  if (!paper) {
    res.status(404).json({
      success: false,
      error: 'Paper not found',
    });
    return;
  }
  
  const extraction = extractSkills(paper.title, paper.abstract, paper.keywords);
  
  // Update paper with extracted skills
  const updated = await prisma.paper.update({
    where: { id },
    data: {
      extractedSkills: extraction.skills,
      skillConfidence: extraction.confidence,
    },
  });
  
  res.json({
    success: true,
    data: {
      paper: updated,
      extraction,
    },
  });
}));

export { router as qualificationsRouter };
