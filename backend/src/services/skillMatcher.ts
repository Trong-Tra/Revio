/**
 * Skill Matching Service
 * 
 * Matches agent skills to paper required skills
 * Calculates match scores for qualification decisions
 */

import { AgentSkill } from '@prisma/client';
import { getParentSkills, getRelatedSkills } from './skillExtractor.js';

export interface MatchResult {
  score: number;              // 0-1 match percentage
  matched: string[];          // Skills that matched
  missing: string[];          // Required skills not found
  partial: Array<{           // Partial matches (related skills)
    required: string;
    agentHas: string;
    relationship: 'parent' | 'sibling' | 'child';
  }>;
  qualified: boolean;         // Passes threshold
  details: MatchDetails;
}

interface MatchDetails {
  exactMatches: number;
  parentMatches: number;      // Agent has broader skill
  childMatches: number;       // Agent has more specific skill
  siblingMatches: number;     // Agent has related skill
  unmatched: number;
}

interface AgentSkillWithLevel extends AgentSkill {
  level: 'NOVICE' | 'PROFICIENT' | 'EXPERT';
}

/**
 * Calculate skill match between paper requirements and agent skills
 */
export function calculateMatch(
  requiredSkills: string[],
  agentSkills: AgentSkillWithLevel[],
  options: {
    minThreshold?: number;
    requireExpertLevel?: string[]; // Skills that require expert level
  } = {}
): MatchResult {
  const { minThreshold = 0.5, requireExpertLevel = [] } = options;
  
  const agentSkillNames = agentSkills.map(s => s.name);
  const matched: string[] = [];
  const missing: string[] = [];
  const partial: MatchResult['partial'] = [];
  
  let exactMatches = 0;
  let parentMatches = 0;
  let childMatches = 0;
  let siblingMatches = 0;
  
  for (const required of requiredSkills) {
    let found = false;
    
    // 1. Check for exact match
    if (agentSkillNames.includes(required)) {
      // Check level requirement
      const agentSkill = agentSkills.find(s => s.name === required);
      if (requireExpertLevel.includes(required) && agentSkill?.level !== 'EXPERT') {
        // Has skill but not at required level - count as partial
        partial.push({
          required,
          agentHas: required,
          relationship: 'parent',
        });
        parentMatches++;
      } else {
        matched.push(required);
        exactMatches++;
      }
      found = true;
      continue;
    }
    
    // 2. Check if agent has parent skill (broader expertise)
    const parents = getParentSkills(required);
    for (const parent of parents) {
      if (agentSkillNames.includes(parent)) {
        partial.push({
          required,
          agentHas: parent,
          relationship: 'parent',
        });
        parentMatches++;
        found = true;
        break;
      }
    }
    if (found) continue;
    
    // 3. Check if agent has child skill (more specific expertise)
    const children = getRelatedSkills(required).filter(r => 
      agentSkillNames.includes(r)
    );
    if (children.length > 0) {
      partial.push({
        required,
        agentHas: children[0],
        relationship: 'child',
      });
      childMatches++;
      found = true;
      continue;
    }
    
    // 4. Check for sibling skills (related expertise)
    const siblings = getRelatedSkills(required).filter(r =>
      agentSkillNames.includes(r) && !parents.includes(r)
    );
    if (siblings.length > 0) {
      partial.push({
        required,
        agentHas: siblings[0],
        relationship: 'sibling',
      });
      siblingMatches++;
      found = true;
      continue;
    }
    
    // Not found
    if (!found) {
      missing.push(required);
    }
  }
  
  // Calculate score
  const totalWeight = requiredSkills.length;
  const weights = {
    exact: 1.0,
    parent: 0.7,
    child: 0.6,
    sibling: 0.4,
  };
  
  const weightedScore = 
    (exactMatches * weights.exact +
     parentMatches * weights.parent +
     childMatches * weights.child +
     siblingMatches * weights.sibling) / totalWeight;
  
  const score = Math.min(weightedScore, 1.0);
  
  return {
    score,
    matched,
    missing,
    partial,
    qualified: score >= minThreshold,
    details: {
      exactMatches,
      parentMatches,
      childMatches,
      siblingMatches,
      unmatched: missing.length,
    },
  };
}

/**
 * Rank multiple agents by match quality for a paper
 */
export function rankAgentsForPaper(
  paperSkills: string[],
  agents: Array<{
    id: string;
    skills: AgentSkillWithLevel[];
    reputation?: number;
  }>,
  options: {
    reputationWeight?: number; // 0-1, how much to weight reputation vs match
  } = {}
): Array<{ agentId: string; matchScore: number; rank: number }> {
  const { reputationWeight = 0.3 } = options;
  
  const scored = agents.map(agent => {
    const match = calculateMatch(paperSkills, agent.skills);
    const reputation = agent.reputation || 0;
    
    // Combined score: match quality + reputation
    const combinedScore = 
      match.score * (1 - reputationWeight) + 
      (reputation / 100) * reputationWeight;
    
    return {
      agentId: agent.id,
      matchScore: match.score,
      combinedScore,
      qualified: match.qualified,
    };
  });
  
  // Sort by combined score descending
  const sorted = scored
    .filter(s => s.qualified) // Only qualified agents
    .sort((a, b) => b.combinedScore - a.combinedScore);
  
  // Add rank
  return sorted.map((s, index) => ({
    agentId: s.agentId,
    matchScore: s.matchScore,
    rank: index + 1,
  }));
}

/**
 * Check if agent can review paper with detailed reasoning
 */
export function canReview(
  agentSkills: AgentSkillWithLevel[],
  paperSkills: string[],
  options: {
    minThreshold?: number;
    requireVerifiedSkills?: boolean;
  } = {}
): { allowed: boolean; reason: string; match: ReturnType<typeof calculateMatch> } {
  const { minThreshold = 0.5, requireVerifiedSkills = false } = options;
  
  const match = calculateMatch(paperSkills, agentSkills, { minThreshold });
  
  if (!match.qualified) {
    return {
      allowed: false,
      reason: `Skill match too low (${(match.score * 100).toFixed(1)}% < ${(minThreshold * 100).toFixed(0)}%). Missing: ${match.missing.join(', ')}`,
      match,
    };
  }
  
  if (requireVerifiedSkills) {
    const unverified = agentSkills.filter(s => 
      match.matched.includes(s.name) && !s.verified
    );
    if (unverified.length > 0) {
      return {
        allowed: false,
        reason: `Skills not verified: ${unverified.map(s => s.name).join(', ')}`,
        match,
      };
    }
  }
  
  return {
    allowed: true,
    reason: `Qualified (match: ${(match.score * 100).toFixed(1)}%)`,
    match,
  };
}

/**
 * Get skill gap analysis for agent
 */
export function analyzeSkillGap(
  requiredSkills: string[],
  agentSkills: AgentSkillWithLevel[]
): {
  gaps: string[];
  suggestions: string[];
  learningPath: string[];
} {
  const match = calculateMatch(requiredSkills, agentSkills);
  
  const gaps = match.missing;
  
  // Suggest related skills agent could learn
  const suggestions: string[] = [];
  for (const gap of gaps) {
    const related = getRelatedSkills(gap);
    const hasRelated = agentSkills.some(s => related.includes(s.name));
    if (hasRelated) {
      suggestions.push(`${gap} (you have related skills)`);
    }
  }
  
  // Build learning path (prerequisites first)
  const learningPath = gaps.map(skill => {
    const parents = getParentSkills(skill);
    return parents.length > 0 
      ? `${parents[0]} → ${skill}`
      : skill;
  });
  
  return {
    gaps,
    suggestions,
    learningPath,
  };
}
