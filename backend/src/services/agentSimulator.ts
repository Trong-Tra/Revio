/**
 * Agent Simulator Service
 * 
 * Simulates AI agents by calling LLM APIs (OpenAI, OpenRouter, etc.)
 * This allows testing the full flow with actual AI-generated reviews locally.
 * 
 * Usage: 
 *   Option 1 - OpenAI: Set OPENAI_API_KEY in .env
 *   Option 2 - OpenRouter (FREE): Set OPENROUTER_API_KEY in .env
 * 
 * OpenRouter Free Models:
 *   - meta-llama/llama-3.2-3b-instruct (fast, decent)
 *   - google/gemini-flash-1.5 (good quality)
 *   - nousresearch/hermes-3-llama-3.1-405b (large, slower)
 */

import pkg from '@prisma/client';
const { PrismaClient, ReviewAttitude } = pkg;
import type { Paper, AgentConfig, ReviewAttitude as ReviewAttitudeType } from '@prisma/client';

const prisma = new PrismaClient();

interface ReviewResult {
  text: string;
  attitude: ReviewAttitudeType;
}

interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  headers: Record<string, string>;
  provider: string;
}

/**
 * Get LLM configuration from environment
 * Priority: OpenRouter > OpenAI > None (mock)
 */
function getLLMConfig(): LLMConfig | null {
  // Check for OpenRouter (FREE option)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    // Free models on OpenRouter
    const freeModels = [
      'meta-llama/llama-3.2-3b-instruct',  // Fast, decent quality
      'google/gemini-flash-1.5',            // Good quality, fast
      'nousresearch/hermes-3-llama-3.1-405b', // Large model, slower
    ];
    
    const model = process.env.OPENROUTER_MODEL || freeModels[0];
    
    return {
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
      model,
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000', // Required by OpenRouter
        'X-Title': 'Revio Agent Simulator', // Optional but nice
      },
      provider: 'OpenRouter'
    };
  }
  
  // Check for OpenAI
  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    return {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: openAIKey,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      provider: 'OpenAI'
    };
  }
  
  return null;
}

/**
 * Simulate an agent reviewing a paper using LLM
 */
export async function simulateReviewWithAI(
  paper: Paper,
  agent: AgentConfig & { skills: Array<{ name: string; level: string }> }
): Promise<ReviewResult> {
  const config = getLLMConfig();
  
  if (!config) {
    console.warn('[AgentSimulator] No API key found (OPENAI_API_KEY or OPENROUTER_API_KEY), using mock review');
    return generateMockReview(paper, agent);
  }

  const prompt = buildReviewPrompt(paper, agent);
  
  console.log(`[AgentSimulator] Using ${config.provider} with ${config.model}`);
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are ${agent.name}, an expert peer reviewer for academic papers. 
Your expertise: ${agent.skills.map(s => s.name).join(', ')}
Tone: ${agent.systemPrompt || 'Academic and constructive'}

Provide a concise review (200-400 words) with:
1. Brief summary of the paper
2. 2-3 specific strengths
3. 2-3 constructive weaknesses
4. Clear recommendation implied by your overall assessment

End with a JSON block:
{"attitude": "POSITIVE|NEUTRAL|NEGATIVE"}

Be critical but fair. Ground all claims in the provided abstract. Be concise.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[AgentSimulator] ${config.provider} error:`, error);
      console.log('[AgentSimulator] Falling back to mock review');
      return generateMockReview(paper, agent);
    }

    const data = await response.json() as any;
    
    // Handle OpenRouter's different response format
    const content = data.choices?.[0]?.message?.content || 
                   data.choices?.[0]?.text || 
                   '';
    
    if (!content) {
      console.error('[AgentSimulator] Empty response from LLM');
      return generateMockReview(paper, agent);
    }
    
    // Parse attitude from JSON block
    const attitudeMatch = content.match(/\{[^}]*"attitude"\s*:\s*"(POSITIVE|NEUTRAL|NEGATIVE)"[^}]*\}/i);
    const attitude = (attitudeMatch?.[1]?.toUpperCase() as ReviewAttitudeType) || 'NEUTRAL';
    
    // Clean up the text (remove JSON block)
    const text = content.replace(/\{[^}]*"attitude"[^}]*\}/gi, '').trim();
    
    console.log(`[AgentSimulator] ${agent.name} reviewed "${paper.title.slice(0, 40)}..." -> ${attitude}`);
    
    return { text, attitude };
    
  } catch (error) {
    console.error('[AgentSimulator] Error:', error);
    console.log('[AgentSimulator] Falling back to mock review');
    return generateMockReview(paper, agent);
  }
}

/**
 * Build prompt for the LLM
 */
function buildReviewPrompt(paper: Paper, agent: AgentConfig): string {
  return `
Please review this academic paper:

TITLE: ${paper.title}

AUTHORS: ${paper.authors.join(', ')}

ABSTRACT: ${paper.abstract}

KEYWORDS: ${paper.keywords.join(', ')}

FIELD: ${paper.field}

Provide your review below:
`;
}

/**
 * Generate a mock review if AI is not available
 */
function generateMockReview(
  paper: Paper,
  agent: AgentConfig & { skills: Array<{ name: string; level: string }> }
): ReviewResult {
  const attitudes: ReviewAttitudeType[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
  const attitude = attitudes[Math.floor(Math.random() * attitudes.length)];
  
  const reviews = {
    POSITIVE: `This paper presents a solid contribution to ${paper.field}. The abstract clearly describes the work and its significance.

Strengths:
- Clear problem statement and motivation
- Methodology appears sound based on the description
- Relevant to current research trends

Weaknesses:
- Limited details in abstract; full paper needed for thorough assessment
- Comparison with related work not fully clear

Overall, this appears to be quality research worth publishing with minor revisions.`,
    
    NEUTRAL: `The paper addresses an interesting topic in ${paper.field}, but the abstract leaves some questions unanswered.

Strengths:
- Timely research topic
- Novel approach suggested

Weaknesses:
- Methodology details insufficient in abstract
- Unclear how results compare to baselines
- Evaluation criteria not specified

The paper would benefit from revision to clarify these points before acceptance.`,
    
    NEGATIVE: `I have significant concerns about this submission to ${paper.field}.

Strengths:
- Addresses a relevant problem

Weaknesses:
- Methodology appears weak based on limited description
- No clear validation approach mentioned
- Claims not sufficiently supported
- Missing critical comparisons with prior work

Major revision or rejection recommended.`
  };
  
  return {
    text: reviews[attitude as keyof typeof reviews],
    attitude
  };
}

/**
 * Run a complete agent simulation test
 * Creates agents, has them review a paper, triggers synthesis
 */
export async function runAgentSimulation(paperId: string): Promise<void> {
  console.log('\n🤖 Starting Agent Simulation\n');
  
  const config = getLLMConfig();
  if (config) {
    console.log(`✓ Using ${config.provider} (${config.model})`);
  } else {
    console.log('⚠ No API key found, will use mock reviews');
    console.log('  Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env for real AI\n');
  }
  
  // 1. Fetch paper
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    include: { conference: true }
  });
  
  if (!paper) {
    throw new Error('Paper not found');
  }
  
  console.log(`📄 Paper: "${paper.title.slice(0, 50)}..."`);
  console.log(`   Required skills: ${paper.requiredSkills.join(', ')}\n`);
  
  // 2. Find qualified agents
  const agents = await prisma.agentConfig.findMany({
    where: { isActive: true },
    include: {
      skills: true,
      reputation: true
    }
  });
  
  console.log(`🔍 Found ${agents.length} active agents\n`);
  
  // 3. Have each qualified agent review
  let reviewedCount = 0;
  
  for (const agent of agents.slice(0, 3)) { // Limit to 3 for testing
    // Check qualification
    const agentSkillNames = agent.skills.map(s => s.name);
    const matches = paper.requiredSkills.filter(req => 
      agentSkillNames.some(agentSkill => 
        agentSkill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(agentSkill.toLowerCase())
      )
    );
    
    const matchScore = matches.length / paper.requiredSkills.length;
    
    if (matchScore < 0.5) {
      console.log(`⏭️  ${agent.name}: Not qualified (match: ${(matchScore * 100).toFixed(0)}%)`);
      continue;
    }
    
    console.log(`📝 ${agent.name}: Qualified (${(matchScore * 100).toFixed(0)}% match), generating review...`);
    
    // Generate review with AI
    const review = await simulateReviewWithAI(paper, agent);
    
    // Save to database
    await prisma.review.create({
      data: {
        paperId: paper.id,
        agentId: agent.id,
        text: review.text,
        attitude: review.attitude
      }
    });
    
    console.log(`   ✅ Saved: ${review.attitude}`);
    if (!config) {
      console.log(`   (Mock review - set API key for real AI)`);
    }
    console.log();
    
    reviewedCount++;
  }
  
  // 4. Check if we have enough reviews for synthesis
  const reviewCount = await prisma.review.count({
    where: { paperId: paper.id }
  });
  
  console.log(`📊 Total reviews: ${reviewCount}\n`);
  
  if (reviewCount >= 2) {
    console.log('🧠 Triggering synthesis...');
    
    // Import synthesis service
    const { synthesizeReviews } = await import('./synthesis.js');
    
    const reviews = await prisma.review.findMany({
      where: { paperId: paper.id }
    });
    
    try {
      const result = await synthesizeReviews({
        paperTitle: paper.title,
        paperAbstract: paper.abstract,
        reviews: reviews.map(r => ({
          agentId: r.agentId,
          text: r.text,
          attitude: r.attitude
        }))
      });
      
      // Save synthesis
      await prisma.reviewSynthesis.create({
        data: {
          paperId: paper.id,
          summary: result.summary,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          recommendation: result.recommendation,
          confidence: result.confidence,
          reviewCount: reviews.length,
          councilIds: reviews.map(r => r.agentId)
        }
      });
      
      // Update paper
      await prisma.paper.update({
        where: { id: paper.id },
        data: { finalResult: result.recommendation }
      });
      
      console.log('✅ Synthesis complete!');
      console.log(`   Recommendation: ${result.recommendation}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Summary: ${result.summary.slice(0, 100)}...\n`);
      
    } catch (error) {
      console.log('⚠️  Synthesis failed (TinyFish not configured?), using local fallback');
      // Local fallback would go here
    }
  } else {
    console.log(`⚠️  Need at least 2 reviews for synthesis (have ${reviewCount})\n`);
  }
  
  console.log('✨ Simulation complete!\n');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const paperId = process.argv[2];
  
  if (!paperId) {
    console.log('Usage: npx tsx src/services/agentSimulator.ts <paper-id>');
    console.log('Or use: npm run simulate <paper-id>\n');
    console.log('Environment Variables:');
    console.log('  OPENROUTER_API_KEY  - Use OpenRouter (FREE models available)');
    console.log('  OPENROUTER_MODEL    - Optional: meta-llama/llama-3.2-3b-instruct (default)');
    console.log('                      - google/gemini-flash-1.5');
    console.log('                      - nousresearch/hermes-3-llama-3.1-405b');
    console.log('  OPENAI_API_KEY      - Use OpenAI instead');
    console.log('  OPENAI_MODEL        - Optional: gpt-4o-mini (default)\n');
    process.exit(1);
  }
  
  runAgentSimulation(paperId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}
