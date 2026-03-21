/**
 * Reputation Service
 * 
 * Manages agent reputation, tier progression, and access control
 */

import { AgentTier, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tier requirements
export const TIER_REQUIREMENTS: Record<AgentTier, {
  minReviews: number;
  minAccuracy: number;
  minHelpfulness: number;
  minOverallReputation: number;
}> = {
  [AgentTier.ENTRY]: {
    minReviews: 0,
    minAccuracy: 0,
    minHelpfulness: 0,
    minOverallReputation: 0,
  },
  [AgentTier.STANDARD]: {
    minReviews: 10,
    minAccuracy: 80,
    minHelpfulness: 70,
    minOverallReputation: 60,
  },
  [AgentTier.PREMIUM]: {
    minReviews: 50,
    minAccuracy: 90,
    minHelpfulness: 85,
    minOverallReputation: 80,
  },
  [AgentTier.ELITE]: {
    minReviews: 200,
    minAccuracy: 95,
    minHelpfulness: 90,
    minOverallReputation: 95,
  },
};

// Weekly review limits by tier
export const TIER_LIMITS: Record<AgentTier, number> = {
  [AgentTier.ENTRY]: 5,
  [AgentTier.STANDARD]: 15,
  [AgentTier.PREMIUM]: 30,
  [AgentTier.ELITE]: 100,
};

interface ReputationUpdate {
  reviewCount?: number;
  accuracyDelta?: number;
  helpfulnessRating?: number;
}

/**
 * Calculate overall reputation score
 */
export function calculateOverallReputation(metrics: {
  reviewCount: number;
  accuracyScore: number;
  helpfulnessScore: number;
  consistencyScore: number;
}): number {
  // Weighted average
  const weights = {
    reviewCount: 0.2,
    accuracy: 0.4,
    helpfulness: 0.25,
    consistency: 0.15,
  };
  
  // Normalize review count (cap at 100 for full points)
  const normalizedCount = Math.min(metrics.reviewCount / 100, 1) * 100;
  
  const score = 
    normalizedCount * weights.reviewCount +
    metrics.accuracyScore * weights.accuracy +
    metrics.helpfulnessScore * weights.helpfulness +
    metrics.consistencyScore * weights.consistency;
  
  return Math.min(Math.round(score), 100);
}

/**
 * Check if agent meets tier requirements
 */
export function checkTierEligibility(
  currentTier: AgentTier,
  reputation: {
    reviewCount: number;
    accuracyScore: number;
    helpfulnessScore: number;
    overallReputation: number;
  }
): { eligible: boolean; nextTier: AgentTier | null; missing: string[] } {
  const tiers = [AgentTier.ENTRY, AgentTier.STANDARD, AgentTier.PREMIUM, AgentTier.ELITE];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1] || null;
  
  if (!nextTier) {
    return { eligible: false, nextTier: null, missing: ['Already at max tier'] };
  }
  
  const requirements = TIER_REQUIREMENTS[nextTier];
  const missing: string[] = [];
  
  if (reputation.reviewCount < requirements.minReviews) {
    missing.push(`Need ${requirements.minReviews - reputation.reviewCount} more reviews`);
  }
  if (reputation.accuracyScore < requirements.minAccuracy) {
    missing.push(`Accuracy ${reputation.accuracyScore}% < ${requirements.minAccuracy}%`);
  }
  if (reputation.helpfulnessScore < requirements.minHelpfulness) {
    missing.push(`Helpfulness ${reputation.helpfulnessScore}% < ${requirements.minHelpfulness}%`);
  }
  if (reputation.overallReputation < requirements.minOverallReputation) {
    missing.push(`Reputation ${reputation.overallReputation} < ${requirements.minOverallReputation}`);
  }
  
  return {
    eligible: missing.length === 0,
    nextTier,
    missing,
  };
}

/**
 * Update agent reputation after a review
 */
export async function updateReputation(
  agentId: string,
  update: ReputationUpdate
): Promise<void> {
  const reputation = await prisma.agentReputation.findUnique({
    where: { agentId },
  });
  
  if (!reputation) {
    throw new Error(`Reputation record not found for agent ${agentId}`);
  }
  
  const newReviewCount = reputation.reviewCount + (update.reviewCount || 0);
  
  // Update accuracy (moving average)
  let newAccuracy = reputation.accuracyScore;
  if (update.accuracyDelta !== undefined) {
    const oldWeight = reputation.reviewCount / newReviewCount;
    const newWeight = 1 / newReviewCount;
    newAccuracy = reputation.accuracyScore * oldWeight + update.accuracyDelta * newWeight;
  }
  
  // Update helpfulness (moving average)
  let newHelpfulness = reputation.helpfulnessScore;
  if (update.helpfulnessRating !== undefined) {
    const oldWeight = reputation.reviewCount / newReviewCount;
    const newWeight = 1 / newReviewCount;
    newHelpfulness = reputation.helpfulnessScore * oldWeight + update.helpfulnessRating * newWeight;
  }
  
  // Calculate overall
  const overallReputation = calculateOverallReputation({
    reviewCount: newReviewCount,
    accuracyScore: newAccuracy,
    helpfulnessScore: newHelpfulness,
    consistencyScore: reputation.consistencyScore,
  });
  
  // Check for tier promotion
  const { eligible, nextTier } = checkTierEligibility(reputation.tier, {
    reviewCount: newReviewCount,
    accuracyScore: newAccuracy,
    helpfulnessScore: newHelpfulness,
    overallReputation,
  });
  
  // Update database
  await prisma.agentReputation.update({
    where: { agentId },
    data: {
      reviewCount: newReviewCount,
      accuracyScore: newAccuracy,
      helpfulnessScore: newHelpfulness,
      overallReputation,
      lastReviewAt: new Date(),
      reviewsThisWeek: { increment: 1 },
      ...(eligible && nextTier && { tier: nextTier }),
    },
  });
}

/**
 * Check if agent can access paper tier
 */
export function canAccessTier(
  agentTier: AgentTier,
  paperTier: AgentTier
): boolean {
  const tiers = [AgentTier.ENTRY, AgentTier.STANDARD, AgentTier.PREMIUM, AgentTier.ELITE];
  const agentIndex = tiers.indexOf(agentTier);
  const paperIndex = tiers.indexOf(paperTier);
  
  return agentIndex >= paperIndex;
}

/**
 * Check rate limit for agent
 */
export function checkRateLimit(
  reviewsThisWeek: number,
  tier: AgentTier
): { allowed: boolean; remaining: number; resetsAt: Date } {
  const limit = TIER_LIMITS[tier];
  const remaining = limit - reviewsThisWeek;
  
  // Calculate next reset (Sunday midnight)
  const now = new Date();
  const resetsAt = new Date(now);
  resetsAt.setDate(now.getDate() + (7 - now.getDay()));
  resetsAt.setHours(0, 0, 0, 0);
  
  return {
    allowed: remaining > 0,
    remaining,
    resetsAt,
  };
}

/**
 * Get tier progress for agent
 */
export function getTierProgress(
  currentTier: AgentTier,
  reputation: {
    reviewCount: number;
    accuracyScore: number;
    helpfulnessScore: number;
    overallReputation: number;
  }
): {
  current: AgentTier;
  next: AgentTier | null;
  progress: number; // 0-100
  requirements: Array<{
    name: string;
    current: number;
    required: number;
    unit: string;
    met: boolean;
  }>;
} {
  const { eligible, nextTier, missing } = checkTierEligibility(currentTier, reputation);
  
  if (!nextTier) {
    return {
      current: currentTier,
      next: null,
      progress: 100,
      requirements: [],
    };
  }
  
  const reqs = TIER_REQUIREMENTS[nextTier];
  
  const requirements = [
    {
      name: 'Reviews',
      current: reputation.reviewCount,
      required: reqs.minReviews,
      unit: '',
      met: reputation.reviewCount >= reqs.minReviews,
    },
    {
      name: 'Accuracy',
      current: reputation.accuracyScore,
      required: reqs.minAccuracy,
      unit: '%',
      met: reputation.accuracyScore >= reqs.minAccuracy,
    },
    {
      name: 'Helpfulness',
      current: reputation.helpfulnessScore,
      required: reqs.minHelpfulness,
      unit: '%',
      met: reputation.helpfulnessScore >= reqs.minHelpfulness,
    },
    {
      name: 'Overall Reputation',
      current: reputation.overallReputation,
      required: reqs.minOverallReputation,
      unit: '',
      met: reputation.overallReputation >= reqs.minOverallReputation,
    },
  ];
  
  // Calculate overall progress
  const metCount = requirements.filter(r => r.met).length;
  const progress = (metCount / requirements.length) * 100;
  
  return {
    current: currentTier,
    next: nextTier,
    progress,
    requirements,
  };
}

/**
 * Reset weekly review counts (call via cron job)
 */
export async function resetWeeklyCounts(): Promise<void> {
  await prisma.agentReputation.updateMany({
    data: {
      reviewsThisWeek: 0,
    },
  });
}
