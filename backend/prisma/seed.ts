import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default agent config
  const agentConfig = await prisma.agentConfig.upsert({
    where: { name: 'default-reviewer' },
    update: {},
    create: {
      name: 'default-reviewer',
      skillsMarkdown: `# Meta-Agent Skill Definition

## Core Capabilities
- Methodology Verification
- Statistical Rigor Analysis
- Citation Graph Traversal
- Novelty Assessment

## Instructions
1. Extract all mathematical formulas and verify their derivations.
2. Cross-reference citations against the OpenAlex database.
3. Flag any claims that lack empirical backing.
4. Assess the novelty of the research contribution.

## Output Format
Return findings in strict JSON format matching the ReviewSchema.`,
      tone: 'Academic',
      systemPrompt: 'You are an expert academic reviewer with deep knowledge across multiple scientific disciplines. Your task is to provide rigorous, objective analysis of research papers. Always ground your assessments in the provided text and avoid hallucinating information.',
      version: 1,
      isActive: true,
    },
  });
  console.log('✅ Agent config created:', agentConfig.name);

  // Create sample papers
  const papers = [
    {
      title: 'Emergent Behaviors in Large Language Models',
      authors: ['Dr. Elena Rostova', 'Prof. James Maxwell'],
      abstract: 'Large language models (LLMs) have demonstrated remarkable capabilities across a wide range of tasks. However, the mechanisms underlying their emergent behaviors remain poorly understood. In this paper, we propose a novel framework for analyzing the internal representations of LLMs...',
      keywords: ['AI', 'NLP', 'Cognitive Science', 'LLM'],
      field: 'Computer Science',
      pdfUrl: 'https://example.com/paper1.pdf',
      pdfKey: 'papers/paper1.pdf',
      doi: '10.1038/s41586-023-00000-1',
    },
    {
      title: 'Quantum Error Correction via Topological Codes',
      authors: ['Prof. James Maxwell'],
      abstract: 'We present a comprehensive analysis of topological quantum error correction codes, focusing on their implementation in near-term quantum devices. Our results demonstrate significant improvements in error thresholds...',
      keywords: ['Quantum Computing', 'Physics', 'Error Correction'],
      field: 'Physics',
      pdfUrl: 'https://example.com/paper2.pdf',
      pdfKey: 'papers/paper2.pdf',
      doi: '10.1038/s41586-023-00000-2',
    },
    {
      title: 'Synthetic Biology Approaches to Carbon Capture',
      authors: ['Dr. Sarah Chen', 'Dr. Michael Park'],
      abstract: 'This study explores engineered microorganisms for enhanced carbon capture. We demonstrate a 40% increase in CO2 sequestration efficiency through genetic modification of cyanobacteria...',
      keywords: ['Biology', 'Climate Tech', 'Synthetic Biology'],
      field: 'Biology',
      pdfUrl: 'https://example.com/paper3.pdf',
      pdfKey: 'papers/paper3.pdf',
      doi: '10.1038/s41586-023-00000-3',
    },
  ];

  for (const paperData of papers) {
    const paper = await prisma.paper.upsert({
      where: { doi: paperData.doi },
      update: {},
      create: paperData,
    });
    console.log('✅ Paper created:', paper.title);

    // Create AI review for each paper
    await prisma.review.upsert({
      where: { 
        id: `${paper.id}-ai-review` 
      },
      update: {},
      create: {
        paperId: paper.id,
        reviewerType: 'AI',
        content: {
          summary: 'This paper presents a rigorous analysis with sound methodology.',
          strengths: [
            'Novel approach to the problem',
            'Comprehensive experimental validation',
            'Clear presentation of results'
          ],
          weaknesses: [
            'Limited discussion of limitations',
            'Some derivations could be expanded'
          ],
          methodologyAnalysis: 'The methodology is sound and well-justified.',
          noveltyAssessment: 'High novelty in the proposed approach.',
          overallScore: 8.5,
          confidence: 0.92,
          findings: [
            { type: 'methodology', status: 'verified', confidence: 0.95 },
            { type: 'novelty', status: 'high', confidence: 0.88 },
            { type: 'citations', status: 'verified', confidence: 0.98 }
          ]
        },
        confidenceScore: 0.92,
        isAccepted: true,
      },
    });
    console.log('✅ AI review created for:', paper.title);
  }

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'reviewer@revio.io' },
    update: {},
    create: {
      email: 'reviewer@revio.io',
      name: 'Dr. A. Turing',
      role: 'reviewer',
    },
  });
  console.log('✅ User created:', user.name);

  // Create a human review
  const firstPaper = await prisma.paper.findFirst({
    where: { title: papers[0].title }
  });

  if (firstPaper) {
    await prisma.review.create({
      data: {
        paperId: firstPaper.id,
        reviewerType: 'HUMAN',
        reviewerId: user.id,
        content: {
          summary: 'The methodology is sound, but the conclusion regarding emergent properties needs more empirical backing.',
          strengths: [
            'Well-structured experimental design',
            'Clear hypotheses'
          ],
          weaknesses: [
            'Insufficient sample size for some claims',
            'Missing ablation studies'
          ],
          overallScore: 7,
          confidence: 0.75
        },
        isAccepted: null, // Pending
      },
    });
    console.log('✅ Human review created');
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
