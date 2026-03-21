/**
 * Agent Simulator Service
 * 
 * Simulates AI agents by calling LLM APIs (OpenAI, etc.)
 * This allows testing the full flow with actual AI-generated reviews locally.
 * 
 * Usage: Set OPENAI_API_KEY in .env, then call simulateReview()
 */

import { PrismaClient, Paper, AgentConfig, ReviewAttitude } from '@prisma/client';

const prisma = new PrismaClient();

interface ReviewResult {
  text: string;
  attitude: ReviewAttitude;
}

/**
 * Simulate an agent reviewing a paper using OpenAI
 */
export async function simulateReviewWithAI(
  paper: Paper,
  agent: AgentConfig & { skills: Array<{ name: string; level: string }> }
): Promise<ReviewResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[AgentSimulator] No OPENAI_API_KEY found, using mock review');
    return generateMockReview(paper, agent);
  }

  const prompt = buildReviewPrompt(paper, agent);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cheapest option for testing
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

Be critical but fair. Ground all claims in the provided abstract.`
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
      console.error('[AgentSimulator] OpenAI error:', error);
      return generateMockReview(paper, agent);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parse attitude from JSON block
    const attitudeMatch = content.match(/\{[^}]*"attitude"\s*:\s*"(POSITIVE|NEUTRAL|NEGATIVE)"[^}]*\}/i);
    const attitude = (attitudeMatch?.[1]?.toUpperCase() as ReviewAttitude) || 'NEUTRAL';
    
    // Clean up the text (remove JSON block)
    const text = content.replace(/\{[^}]*"attitude"[^}]*\}/gi, '').trim();
    
    console.log(`[AgentSimulator] ${agent.name} reviewed "${paper.title.slice(0, 40)}..." -> ${attitude}`);
    
    return { text, attitude };
    
  } catch (error) {
    console.error('[AgentSimulator] Error:', error);
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
  const attitudes: ReviewAttitude[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
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
    text: reviews[attitude],
    attitude
  };
}

/**
 * Run a complete agent simulation test
 * Creates agents, has them review a paper, triggers synthesis
 */
export async function runAgentSimulation(paperId: string): Promise<void> {
  console.log('\n🤖 Starting Agent Simulation\n');
  
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
    
    console.log(`   ✅ Saved: ${review.attitude}\n`);
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
        paperId: paper.id,
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
  }
  
  console.log('✨ Simulation complete!\n');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const paperId = process.argv[2];
  
  if (!paperId) {
    console.log('Usage: npx tsx src/services/agentSimulator.ts <paper-id>');
    console.log('Or use: npm run simulate <paper-id>');
    process.exit(1);
  }
  
  runAgentSimulation(paperId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}
