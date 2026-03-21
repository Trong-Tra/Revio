#!/usr/bin/env tsx
/**
 * Demo Agent Spawner
 * 
 * Instantly creates AI agents with OpenRouter and assigns them to review papers.
 * Perfect for live demos - run this after users submit papers!
 * 
 * Usage:
 *   cd backend && npx tsx scripts/demo-agents.ts <paper-id>
 *   
 * Or spawn agents only:
 *   cd backend && npx tsx scripts/demo-agents.ts --create-only
 */

import pkg from '@prisma/client';
const { PrismaClient, ReviewAttitude, AgentTier } = pkg;

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'https://revio-16h9.onrender.com/api/v1';

// Pre-defined agent personalities with different skills
const AGENT_PERSONALITIES = [
  {
    name: 'Dr. Sarah Chen - ML Expert',
    skills: [
      { name: 'machine-learning', level: 'EXPERT' },
      { name: 'deep-learning', level: 'EXPERT' },
      { name: 'neural-networks', level: 'PROFICIENT' },
      { name: 'computer-vision', level: 'PROFICIENT' },
    ],
    tone: 'supportive_but_critical',
    attitudeBias: 'mostly_positive',
  },
  {
    name: 'Prof. Michael Ross - Systems Researcher',
    skills: [
      { name: 'distributed-systems', level: 'EXPERT' },
      { name: 'databases', level: 'EXPERT' },
      { name: 'cloud-computing', level: 'PROFICIENT' },
      { name: 'systems-design', level: 'EXPERT' },
    ],
    tone: 'rigorous_methodical',
    attitudeBias: 'balanced',
  },
  {
    name: 'Dr. Emily Watson - NLP Specialist',
    skills: [
      { name: 'natural-language-processing', level: 'EXPERT' },
      { name: 'transformers', level: 'EXPERT' },
      { name: 'linguistics', level: 'PROFICIENT' },
      { name: 'machine-learning', level: 'PROFICIENT' },
    ],
    tone: 'encouraging_constructive',
    attitudeBias: 'mostly_positive',
  },
  {
    name: 'Prof. James Liu - Theory Expert',
    skills: [
      { name: 'algorithms', level: 'EXPERT' },
      { name: 'complexity-theory', level: 'EXPERT' },
      { name: 'mathematical-proofs', level: 'EXPERT' },
      { name: 'optimization', level: 'PROFICIENT' },
    ],
    tone: 'critical_picky',
    attitudeBias: 'mostly_negative',
  },
  {
    name: 'Dr. Anna Kowalski - Applied AI',
    skills: [
      { name: 'applied-ai', level: 'EXPERT' },
      { name: 'industry-applications', level: 'EXPERT' },
      { name: 'practical-ml', level: 'EXPERT' },
      { name: 'evaluation-metrics', level: 'PROFICIENT' },
    ],
    tone: 'practical_results_oriented',
    attitudeBias: 'balanced',
  },
  {
    name: 'Prof. David Kim - Data Science',
    skills: [
      { name: 'data-science', level: 'EXPERT' },
      { name: 'statistics', level: 'EXPERT' },
      { name: 'experimental-design', level: 'PROFICIENT' },
      { name: 'data-visualization', level: 'PROFICIENT' },
    ],
    tone: 'statistical_rigorous',
    attitudeBias: 'balanced',
  },
];

interface ReviewResult {
  text: string;
  attitude: any;
}

/**
 * Generate AI review using OpenRouter
 */
async function generateAIReview(
  paper: any,
  agent: any
): Promise<ReviewResult> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!openRouterKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const paperContent = `
Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.abstract}
Keywords: ${paper.keywords.join(', ')}
Field: ${paper.field}
`;

  const prompt = `You are ${agent.name}, an expert reviewer with skills in: ${agent.skills.map((s: any) => s.name).join(', ')}.

Your review style is: ${agent.tone.replace('_', ' ')}

Review this research paper and provide:
1. A detailed review (300-500 words) discussing strengths, weaknesses, and suggestions
2. Your overall attitude: POSITIVE (accept), NEUTRAL (minor revisions), or NEGATIVE (major revisions/reject)

Format your response as JSON:
{
  "review": "your detailed review text here",
  "attitude": "POSITIVE|NEUTRAL|NEGATIVE"
}

Be specific, constructive, and reference the actual content of the paper.`;

  const model = process.env.OPENROUTER_MODEL || 'arcee-ai/trinity-large-preview:free';
  
  console.log(`[OpenRouter] ${agent.name} reviewing "${paper.title.substring(0, 40)}..."`);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: paperContent }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content || '';

  // Parse JSON from response
  try {
    const jsonMatch = content.match(/\{[^}]*"review"[^}]*"attitude"[^}]*\}/s);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.review,
        attitude: parsed.attitude.toUpperCase(),
      };
    }
  } catch (e) {
    // Fallback to text parsing
  }

  // Fallback: extract attitude from text
  const attitudeMatch = content.match(/attitude["\s:]+(POSITIVE|NEUTRAL|NEGATIVE)/i);
  const attitude = (attitudeMatch?.[1]?.toUpperCase() || 'NEUTRAL');
  
  return {
    text: content.replace(/\{[^}]*\}/g, '').trim() || 'Review generated by AI agent.',
    attitude,
  };
}

/**
 * Create a single agent in the database
 */
async function createAgent(personality: typeof AGENT_PERSONALITIES[0]) {
  // Check if agent already exists
  const existing = await prisma.agentConfig.findUnique({
    where: { name: personality.name },
  });

  if (existing) {
    console.log(`✓ Agent exists: ${personality.name}`);
    return existing;
  }

  // Create agent config
  const agent = await prisma.agentConfig.create({
    data: {
      name: personality.name,
      agentType: 'REVIEWER',
      systemPrompt: `You are ${personality.name}. Review style: ${personality.tone}.`,
      fields: personality.skills.map((s: any) => s.name),
      isActive: true,
      version: 1,
      description: `AI reviewer with expertise in ${personality.skills.map((s: any) => s.name).join(', ')}`,
    },
  });

  // Create skills
  await prisma.agentSkill.createMany({
    data: personality.skills.map((skill: any) => ({
      agentId: agent.id,
      name: skill.name,
      level: skill.level,
      verified: true,
    })),
  });

  // Create reputation
  await prisma.agentReputation.create({
    data: {
      agentId: agent.id,
      tier: 'STANDARD' as any,
      reviewCount: 0,
      accuracyScore: 85,
      helpfulnessScore: 80,
      consistencyScore: 82,
      overallReputation: 82,
    },
  });

  console.log(`✅ Created agent: ${personality.name}`);
  return agent;
}

/**
 * Create all demo agents
 */
async function createAllAgents() {
  console.log('\n🤖 Creating Demo Agents...\n');
  
  const agents = [];
  for (const personality of AGENT_PERSONALITIES) {
    const agent = await createAgent(personality);
    agents.push({ ...agent, ...personality });
  }
  
  console.log(`\n✅ Created ${agents.length} agents\n`);
  return agents;
}

/**
 * Submit a review for a paper
 */
async function submitReview(paperId: string, agentId: string, review: ReviewResult) {
  try {
    // Use direct Prisma insert
    await prisma.review.create({
      data: {
        paperId,
        agentId,
        text: review.text,
        attitude: review.attitude as any,
      },
    });

    // Update agent reputation
    await prisma.agentReputation.updateMany({
      where: { agentId },
      data: {
        reviewCount: { increment: 1 },
        lastReviewAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error(`Failed to submit review:`, error);
    return false;
  }
}

/**
 * Have all agents review a specific paper
 */
async function reviewPaper(paperId: string) {
  console.log(`\n📄 Reviewing paper: ${paperId}\n`);

  // Get paper
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
  });

  if (!paper) {
    throw new Error(`Paper not found: ${paperId}`);
  }

  // Get all active agents
  const agents = await prisma.agentConfig.findMany({
    where: { isActive: true },
    include: { skills: true },
  });

  if (agents.length === 0) {
    console.log('No agents found. Creating demo agents first...');
    await createAllAgents();
    return reviewPaper(paperId);
  }

  console.log(`Found ${agents.length} agents to review`);

  // Have each agent review
  const results = [];
  for (const agent of agents) {
    try {
      // Check if already reviewed
      const existing = await prisma.review.findFirst({
        where: { paperId, agentId: agent.id },
      });

      if (existing) {
        console.log(`  ⏭️  ${agent.name} already reviewed`);
        continue;
      }

      console.log(`  📝 ${agent.name} generating review...`);
      const review = await generateAIReview(paper, agent);
      
      await submitReview(paperId, agent.id, review);
      console.log(`  ✅ ${agent.name}: ${review.attitude}`);
      
      results.push({ agent: agent.name, attitude: review.attitude });
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`  ❌ ${agent.name} failed:`, error);
    }
  }

  console.log(`\n✅ Completed ${results.length} reviews\n`);
  console.log('Summary:');
  results.forEach(r => console.log(`  - ${r.agent}: ${r.attitude}`));

  return results;
}

/**
 * Main script
 */
async function main() {
  const args = process.argv.slice(2);
  const paperId = args[0];

  console.log('╔═══════════════════════════════════════╗');
  console.log('║     🤖 Revio Demo Agent Spawner       ║');
  console.log('╚═══════════════════════════════════════╝\n');

  if (!paperId || paperId === '--create-only') {
    // Just create agents, no paper to review
    console.log('Mode: Create agents only\n');
    await createAllAgents();
    console.log('\n✅ Agents ready for demo!');
    console.log('Next: Submit a paper, then run:');
    console.log(`  npx tsx scripts/demo-agents.ts <paper-id>`);
  } else {
    // Review specific paper
    await createAllAgents();
    await reviewPaper(paperId);
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Script failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
