/**
 * Qualification Engine
 * 
 * The core service that determines if an agent can review a paper
 * Combines: skill matching + tier access + rate limiting
 */

import { AgentTier, PaperTier, PrismaClient } from '@prisma/client';
import { calculateMatch, rankAgentsForPaper } from './skillMatcher.js';
import { canAccessTier, checkRateLimit, TIER_LIMITS } from './reputation.js';

const prisma = new PrismaClient();

export interface QualificationResult {
  allowed: boolean;
  reason: string;
  matchScore: number;
  skillMatch?: {
    matched: string[];
    missing: string[];
    partial: Array<{
      required: string;
      agentHas: string;
      relationship: string;
    }>;
  };
  tierCheck?: {
    agentTier: AgentTier;
    paperTier: PaperTier;
    allowed: boolean;
  };
  rateLimit?: {
    allowed: boolean;
    remaining: number;
    limit: number;
  };
}

export interface CouncilFormationResult {
  paperId: string;
  councilSize: number;
  assignedAgents: Array<{
    agentId: string;
    rank: number;
    matchScore: number;
    agentTier: AgentTier;
  }>;
  notAssigned: Array<{
    agentId: string;
    reason: string;
  }>;
}

/**
 * Check if agent can review paper
 * The main qualification check
 */
export async function canReview(
  agentId: string,
  paperId: string
): Promise<QualificationResult> {
  // Fetch agent data
  const agent = await prisma.agentConfig.findUnique({
    where: { id: agentId },
    include: {
      // @ts-ignore - we know these exist
      skills: true,
      // @ts-ignore
      reputation: true,
    },
  });
  
  if (!agent) {
    return { allowed: false, reason: 'Agent not found', matchScore: 0 };
  }
  
  // Fetch paper data
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
  });
  
  if (!paper) {
    return { allowed: false, reason: 'Paper not found', matchScore: 0 };
  }
  
  // Check if already reviewed
  const existingReview = await prisma.review.findFirst({
    where: {
      paperId,
      agentId,
    },
  });
  
  if (existingReview) {
    return { allowed: false, reason: 'Already reviewed this paper', matchScore: 0 };
  }
  
  // Get agent reputation
  // @ts-ignore
  const reputation = agent.reputation;
  if (!reputation) {
    return { allowed: false, reason: 'Agent reputation not found', matchScore: 0 };
  }
  
  // 1. Check tier access
  const tierAllowed = canAccessTier(reputation.tier, paper.tier);
  if (!tierAllowed) {
    return {
      allowed: false,
      reason: `Insufficient tier: Agent is ${reputation.tier}, paper requires ${paper.tier}`,
      matchScore: 0,
      tierCheck: {
        agentTier: reputation.tier,
        paperTier: paper.tier,
        allowed: false,
      },
    };
  }
  
  // 2. Check rate limit
  const rateCheck = checkRateLimit(reputation.reviewsThisWeek, reputation.tier);
  if (!rateCheck.allowed) {
    return {
      allowed: false,
      reason: `Weekly review limit reached: ${rateCheck.remaining} remaining, resets ${rateCheck.resetsAt.toISOString()}`,
      matchScore: 0,
      tierCheck: {
        agentTier: reputation.tier,
        paperTier: paper.tier,
        allowed: true,
      },
      rateLimit: {
        allowed: false,
        remaining: rateCheck.remaining,
        limit: TIER_LIMITS[reputation.tier],
      },
    };
  }
  
  // 3. Check skill match
  const paperSkills = paper.requiredSkills.length > 0 
    ? paper.requiredSkills 
    : paper.extractedSkills;
  
  if (paperSkills.length === 0) {
    // No skills required - allow but warn
    return {
      allowed: true,
      reason: `Qualified (no specific skills required). Tier: ${reputation.tier}`,
      matchScore: 1.0,
      tierCheck: {
        agentTier: reputation.tier,
        paperTier: paper.tier,
        allowed: true,
      },
      rateLimit: {
        allowed: true,
        remaining: rateCheck.remaining,
        limit: TIER_LIMITS[reputation.tier],
      },
    };
  }
  
  // @ts-ignore
  const match = calculateMatch(paperSkills, agent.skills);
  
  if (!match.qualified) {
    return {
      allowed: false,
      reason: `Skills mismatch: ${(match.score * 100).toFixed(1)}% match (need 50%+). Missing: ${match.missing.slice(0, 3).join(', ')}${match.missing.length > 3 ? '...' : ''}`,
      matchScore: match.score,
      skillMatch: {
        matched: match.matched,
        missing: match.missing,
        partial: match.partial,
      },
      tierCheck: {
        agentTier: reputation.tier,
        paperTier: paper.tier,
        allowed: true,
      },
      rateLimit: {
        allowed: true,
        remaining: rateCheck.remaining,
        limit: TIER_LIMITS[reputation.tier],
      },
    };
  }
  
  // All checks passed
  return {
    allowed: true,
    reason: `Qualified: ${(match.score * 100).toFixed(0)}% skill match, ${reputation.tier} tier`,
    matchScore: match.score,
    skillMatch: {
      matched: match.matched,
      missing: match.missing,
      partial: match.partial,
    },
    tierCheck: {
      agentTier: reputation.tier,
      paperTier: paper.tier,
      allowed: true,
    },
    rateLimit: {
      allowed: true,
      remaining: rateCheck.remaining,
      limit: TIER_LIMITS[reputation.tier],
    },
  };
}

/**
 * Form an agent council for a paper
 * Selects top N qualified agents
 */
export async function formCouncil(
  paperId: string,
  options: {
    councilSize?: number;
    reputationWeight?: number;
  } = {}
): Promise<CouncilFormationResult> {
  const { councilSize = 3, reputationWeight = 0.3 } = options;
  
  // Fetch paper
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
  });
  
  if (!paper) {
    throw new Error(`Paper ${paperId} not found`);
  }
  
  const paperSkills = paper.requiredSkills.length > 0
    ? paper.requiredSkills
    : paper.extractedSkills;
  
  // Fetch all active agents with their skills and reputation
  const agents = await prisma.agentConfig.findMany({
    where: { isActive: true },
    include: {
      // @ts-ignore
      skills: true,
      // @ts-ignore
      reputation: true,
    },
  });
  
  // Filter and score agents
  const qualified: Array<{
    agentId: string;
    matchScore: number;
    combinedScore: number;
    agentTier: AgentTier;
  }> = [];
  
  const notAssigned: Array<{ agentId: string; reason: string }> = [];
  
  for (const agent of agents) {
    // @ts-ignore
    const reputation = agent.reputation;
    if (!reputation) continue;
    
    // Check tier access
    if (!canAccessTier(reputation.tier, paper.tier)) {
      notAssigned.push({
        agentId: agent.id,
        reason: `Tier mismatch: ${reputation.tier} < ${paper.tier}`,
      });
      continue;
    }
    
    // Check rate limit
    const rateCheck = checkRateLimit(reputation.reviewsThisWeek, reputation.tier);
    if (!rateCheck.allowed) {
      notAssigned.push({
        agentId: agent.id,
        reason: 'Weekly limit reached',
      });
      continue;
    }
    
    // Check skill match
    // @ts-ignore
    const match = calculateMatch(paperSkills, agent.skills);
    if (!match.qualified) {
      notAssigned.push({
        agentId: agent.id,
        reason: `Skills mismatch: ${(match.score * 100).toFixed(0)}%`,
      });
      continue;
    }
    
    // Calculate combined score
    const combinedScore = 
      match.score * (1 - reputationWeight) +
      (reputation.overallReputation / 100) * reputationWeight;
    
    qualified.push({
      agentId: agent.id,
      matchScore: match.score,
      combinedScore,
      agentTier: reputation.tier,
    });
  }
  
  // Sort by combined score
  qualified.sort((a, b) => b.combinedScore - a.combinedScore);
  
  // Select top N
  const assigned = qualified.slice(0, councilSize);
  
  // Update paper with assigned agents
  await prisma.paper.update({
    where: { id: paperId },
    data: {
      assignedAgents: assigned.map(a => a.agentId),
      status: 'UNDER_REVIEW',
    },
  });
  
  return {
    paperId,
    councilSize,
    assignedAgents: assigned.map((a, index) => ({
      ...a,
      rank: index + 1,
    })),
    notAssigned,
  };
}

/**
 * Get qualification status for multiple agents on a paper
 */
export async function getQualificationStatus(
  paperId: string,
  agentIds: string[]
): Promise<Array<{ agentId: string; result: QualificationResult }>> {
  const results = await Promise.all(
    agentIds.map(async (agentId) => ({
      agentId,
      result: await canReview(agentId, paperId),
    }))
  );
  
  return results;
}

/**
 * Get all qualified agents for a paper
 */
export async function getQualifiedAgents(
  paperId: string
): Promise<Array<{
  agentId: string;
  name: string;
  matchScore: number;
  tier: AgentTier;
}>> {
  // Fetch all active agents
  const agents = await prisma.agentConfig.findMany({
    where: { isActive: true },
    include: {
      // @ts-ignore
      reputation: true,
    },
  });
  
  const results: Array<{
    agentId: string;
    name: string;
    matchScore: number;
    tier: AgentTier;
  }> = [];
  
  for (const agent of agents) {
    const result = await canReview(agent.id, paperId);
    if (result.allowed) {
      results.push({
        agentId: agent.id,
        name: agent.name,
        matchScore: result.matchScore,
        // @ts-ignore
        tier: agent.reputation?.tier || AgentTier.ENTRY,
      });
    }
  }
  
  // Sort by match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
