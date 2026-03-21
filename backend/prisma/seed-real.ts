import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding with real published papers...');

  // Create default agent config
  const agentConfig = await prisma.agentConfig.upsert({
    where: { name: 'default-reviewer' },
    update: {},
    create: {
      name: 'default-reviewer',
      agentType: 'REVIEWER',
      skillsUrl: '/SKILL.md',
      reviewUrl: '/REVIEW.md',
      fieldsUrl: '/FIELDS.md',
      ethicsUrl: '/ETHICS.md',
      skillsMarkdown: `# Meta-Agent Skill Definition

## Core Capabilities
- Blockchain & Distributed Systems Analysis
- Cryptographic Protocol Verification
- Consensus Mechanism Evaluation
- Academic Paper Review

## Instructions
1. Analyze technical architecture and innovations
2. Evaluate experimental methodology and results
3. Assess security considerations and limitations
4. Compare with related work in the field
5. Provide structured assessment with confidence scores

## Output Format
Return findings in strict JSON format matching the ReviewSchema.`,
      tone: 'Academic',
      systemPrompt: 'You are an expert academic reviewer specializing in blockchain, distributed systems, and cryptographic protocols. Your task is to provide rigorous, objective analysis of research papers with particular attention to technical correctness, security implications, and practical feasibility.',
      fields: ['Computer Science', 'Blockchain', 'Cryptography', 'Distributed Systems'],
      version: 1,
      isActive: true,
    },
  });
  console.log('✅ Agent config created:', agentConfig.name);

  // Paper 1: Lotus Bridge
  const paper1 = await prisma.paper.upsert({
    where: { doi: '10.1109/Blockchain62876.2024.00031' },
    update: {},
    create: {
      title: 'Lotus Bridge: A Hybrid Architecture for Cross-Chain Sovereign Digital Identity',
      authors: ['Tran Minh Trong', 'Tran Khanh Dang', 'Pham Nguyen Khang', 'Le Anh Cong'],
      abstract: 'This paper introduces Lotus Bridge, a hybrid decentralized identity framework that combines state-backed Proof-of-Authority credential issuance with cross-chain verification via zero-knowledge proofs. The framework establishes two fundamental protocols: state-anchored credential issuance and cross-chain privacy-preserving verification. Experimental evaluation demonstrates impressive performance with cryptographic proofs under 600 bytes, end-to-end verification latency below 2 seconds, and up to 75% cost savings compared to existing Ethereum and Polygon solutions. The work addresses the critical challenge of integrating decentralized identity systems with state authorities while balancing government sovereignty requirements with user privacy and cross-chain interoperability.',
      keywords: ['Decentralized Identity', 'Cross-Chain', 'Zero-Knowledge Proofs', 'Blockchain', 'Digital Identity', 'Groth16', 'Privacy-Preserving'],
      field: 'Computer Science',
      pdfUrl: 'https://ieeexplore.ieee.org/document/11231625',
      pdfKey: 'papers/lotus-bridge.pdf',
      doi: '10.1109/Blockchain62876.2024.00031',
      metadata: {
        venue: 'IEEE International Conference on Blockchain (Blockchain-2024)',
        year: 2024,
        pages: '31-38',
        publisher: 'IEEE',
        citations: 0,
        github: null,
      },
    },
  });
  console.log('✅ Paper 1 created:', paper1.title);

  // AI Review for Paper 1
  await prisma.review.upsert({
    where: { id: `${paper1.id}-ai-review` },
    update: {},
    create: {
      paperId: paper1.id,
      reviewerType: 'AI',
      content: {
        summary: 'This paper presents Lotus Bridge, an innovative hybrid architecture for sovereign digital identity that effectively bridges government credential systems with decentralized blockchain networks through zero-knowledge proofs.',
        strengths: [
          'Novel hybrid architecture combining state-backed PoA with cross-chain ZK verification',
          'Strong experimental results: <600 byte proofs, <2s latency, 75% cost reduction',
          'Addresses real-world need for government-integrated DID systems',
          'Well-structured protocols for credential issuance and verification'
        ],
        weaknesses: [
          'Groth16 trusted setup introduces security risks not fully mitigated',
          'Governance model lacks concrete mechanisms for validator monitoring',
          'Limited comparison with existing government DID systems',
          'No real-world deployment validation presented'
        ],
        methodologyAnalysis: 'The experimental methodology using Hyperledger Besu and comparison with Ethereum/Polygon is sound. Performance metrics are comprehensive and demonstrate practical feasibility.',
        noveltyAssessment: 'High novelty in combining state-anchored credentials with cross-chain ZK verification. The hybrid approach is innovative and timely.',
        overallScore: 7,
        confidence: 0.85,
        findings: [
          { type: 'methodology', status: 'verified', confidence: 0.88 },
          { type: 'novelty', status: 'high', confidence: 0.90 },
          { type: 'security', status: 'questionable', confidence: 0.72 },
          { type: 'governance', status: 'incomplete', confidence: 0.65 },
          { type: 'experimental_scale', status: 'limited', confidence: 0.70 }
        ]
      },
      confidenceScore: 0.85,
      isAccepted: null, // Pending decision
    },
  });
  console.log('✅ AI review created for Paper 1');

  // Human Review 1 for Paper 1 (Reviewer A - Weak Accept)
  const user1 = await prisma.user.upsert({
    where: { email: 'reviewer1@ieee.org' },
    update: {},
    create: {
      email: 'reviewer1@ieee.org',
      name: 'Dr. A. Blockchain',
      role: 'reviewer',
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper1.id,
      reviewerType: 'HUMAN',
      reviewerId: user1.id,
      content: {
        summary: 'The paper introduces Lotus Bridge, a hybrid decentralized identity framework that combines state-backed PoA credential issuance with cross-chain verification via zero-knowledge proofs. The prototype shows strong performance in proof size, latency, and cost, offering a scalable solution that aligns government requirements with decentralized identity. However, challenges remain regarding trusted setup, deployment, and governance.',
        strengths: [
          'Innovative hybrid architecture balancing state sovereignty with decentralization',
          'Impressive performance metrics: <600B proofs, <2s latency, 75% cost savings',
          'Addresses significant real-world problem of government-DID integration'
        ],
        weaknesses: [
          'Groth16 trusted setup risks not adequately addressed',
          'Governance model is abstract without concrete mechanisms',
          'Lacks validator monitoring and conflict resolution details',
          'Needs quantitative analysis of governance resilience'
        ],
        methodologyAnalysis: 'Experimental evaluation is thorough but limited in scale. Comparison with Ethereum and Polygon is valuable.',
        noveltyAssessment: 'Good quality work with moderate novelty. The combination is innovative but building on existing primitives.',
        overallScore: 6,
        confidence: 0.82,
        recommendation: 'WEAK ACCEPT - Major revision needed for governance and security limitations before final acceptance.',
        evaluation: 'Two major issues require attention. First, the reliance on Groth16 entails trusted setup risks that could compromise security if not rigorously controlled; thus, a discussion on alternative proving systems would strengthen the paper. Second, the governance model is presented in a rather abstract manner and lacks concrete mechanisms for validator monitoring, conflict resolution, and defense against takeover attempts. Incorporating quantitative analysis of governance resilience and adversarial scenario simulations would significantly enhance the work.'
      },
      isAccepted: null,
    },
  });
  console.log('✅ Human review 1 created for Paper 1');

  // Human Review 2 for Paper 1 (Reviewer B - Accept with revision)
  const user2 = await prisma.user.upsert({
    where: { email: 'reviewer2@ieee.org' },
    update: {},
    create: {
      email: 'reviewer2@ieee.org',
      name: 'Prof. C. Cryptography',
      role: 'reviewer',
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper1.id,
      reviewerType: 'HUMAN',
      reviewerId: user2.id,
      content: {
        summary: 'This paper introduces Lotus Bridge, a hybrid cross-chain framework designed to tackle the challenge of integrating decentralized identity (DID) systems with state authorities. The framework integrates a permissioned Proof-of-Authority blockchain for the issuance of sovereign credentials alongside a cross-chain verification bridge that employs zero-knowledge proofs to ensure privacy-preserving selective disclosure.',
        strengths: [
          'Addresses significant and relatively overlooked issue of government-DID integration',
          'Innovative hybrid architecture balancing state sovereignty with privacy',
          'Sound technical design with promising performance characteristics',
          'Well-structured presentation of protocols and evaluation'
        ],
        weaknesses: [
          'Reliance on Groth16 trusted setup introduces long-term security concerns',
          'Lacks comparison with existing government DID systems',
          'No real-world deployment validation',
          'Needs expanded testing scale'
        ],
        methodologyAnalysis: 'Technical design is sound and experimental evaluation demonstrates promising performance.',
        noveltyAssessment: 'Valuable contribution to important underexplored area. The hybrid approach is innovative.',
        overallScore: 7,
        confidence: 0.88,
        recommendation: 'ACCEPT WITH MAJOR REVISIONS',
        evaluation: 'This paper makes a valuable contribution to an important and underexplored area of digital identity research. The hybrid architecture is innovative and addresses real-world needs for government-integrated DID systems. The paper needs major revisions focusing on: (1) more detailed analysis of trusted setup risks and mitigation strategies, (2) expanded testing scale and comparison with existing systems, (3) additional governance model details and real-world validation.'
      },
      isAccepted: null,
    },
  });
  console.log('✅ Human review 2 created for Paper 1');

  // Paper 2: Proof-of-Merit
  const paper2 = await prisma.paper.upsert({
    where: { doi: '10.1109/COMPSAC61126.2024.00064' },
    update: {},
    create: {
      title: 'Proof-of-Merit: A Hybrid Consensus and Governance Mechanism for Learn-to-Earn Ecosystems',
      authors: ['Tran Minh Trong', 'Tran Khanh Dang', 'Nguyen An Khuong', 'Huynh Thai Hoc'],
      abstract: 'This paper introduces Proof-of-Merit (PoM), a hybrid consensus and governance mechanism combining Proof-of-Authority, Verifiable Random Functions, and a dual-token model integrating both stake and non-transferable academic reputation. PoM selects validators through a weighted combination of transferable stake (UIT-Coin) and non-transferable academic reputation (UIT-Rep), earned via verifiable on-chain learning activities. The mechanism addresses fairness and sustainability in educational blockchains by aligning blockchain governance with pedagogical values. Implementation on Hyperledger Besu and evaluation using Hyperledger Caliper demonstrates high performance and improved fairness metrics compared to existing protocols, with lower Gini coefficient and higher Nakamoto coefficient than PoA and IBFT 2.0.',
      keywords: ['Consensus Mechanism', 'Proof-of-Merit', 'Learn-to-Earn', 'Educational Blockchain', 'Hyperledger Besu', 'Governance', 'Reputation System'],
      field: 'Computer Science',
      pdfUrl: 'https://ieeexplore.ieee.org/document/11365043',
      pdfKey: 'papers/proof-of-merit.pdf',
      doi: '10.1109/COMPSAC61126.2024.00064',
      metadata: {
        venue: 'IEEE 48th Annual Computers, Software, and Applications Conference (COMPSAC 2024)',
        year: 2024,
        pages: '389-398',
        publisher: 'IEEE',
        citations: 0,
        github: null,
      },
    },
  });
  console.log('✅ Paper 2 created:', paper2.title);

  // AI Review for Paper 2
  await prisma.review.upsert({
    where: { id: `${paper2.id}-ai-review` },
    update: {},
    create: {
      paperId: paper2.id,
      reviewerType: 'AI',
      content: {
        summary: 'This paper presents Proof-of-Merit (PoM), a novel consensus mechanism that innovatively combines stake and academic reputation for educational blockchain ecosystems, demonstrating strong fairness improvements over traditional PoA and IBFT 2.0.',
        strengths: [
          'Highly original contribution combining PoA, VRFs, and dual-token model',
          'Strong theoretical foundation linking governance to pedagogical values',
          'Comprehensive evaluation using Hyperledger Caliper with quantitative fairness metrics',
          'Clear empirical evidence of improved fairness (lower Gini, higher Nakamoto)',
          'Well-written and logically structured presentation'
        ],
        weaknesses: [
          'Limited to 12 validators in experiments - scalability claims constrained',
          'Minimal analysis of security threats (collusion, reputation manipulation)',
          'Single implementation platform (Hyperledger Besu only)',
          'Some references appear mismatched to the topic'
        ],
        methodologyAnalysis: 'Rigorous methodology using industry-standard tools (Hyperledger Besu, Caliper). Quantitative comparison using Gini and Nakamoto coefficients is convincing and appropriate for fairness evaluation.',
        noveltyAssessment: 'Significant original work. The integration of academic reputation into consensus is novel and highly relevant to Learn-to-Earn ecosystems.',
        overallScore: 8,
        confidence: 0.90,
        findings: [
          { type: 'methodology', status: 'verified', confidence: 0.92 },
          { type: 'novelty', status: 'significant', confidence: 0.93 },
          { type: 'experimental_scale', status: 'limited', confidence: 0.75 },
          { type: 'security_analysis', status: 'incomplete', confidence: 0.68 },
          { type: 'presentation', status: 'excellent', confidence: 0.90 }
        ]
      },
      confidenceScore: 0.90,
      isAccepted: true,
    },
  });
  console.log('✅ AI review created for Paper 2');

  // Human Review 1 for Paper 2 (Strong Accept)
  const user3 = await prisma.user.upsert({
    where: { email: 'reviewer3@ieee.org' },
    update: {},
    create: {
      email: 'reviewer3@ieee.org',
      name: 'Dr. E. Distributed Systems',
      role: 'reviewer',
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: 'HUMAN',
      reviewerId: user3.id,
      content: {
        summary: 'The paper demonstrates strong originality and technical depth through its introduction of Proof-of-Merit (PoM) — a hybrid consensus and governance mechanism combining Proof-of-Authority, Verifiable Random Functions, and a dual-token model integrating both stake and non-transferable academic reputation.',
        strengths: [
          'Strong originality and technical depth in consensus design',
          'Innovative alignment of blockchain governance with pedagogical values',
          'Thorough implementation and evaluation using industry-standard tools',
          'Clear empirical evidence of improved fairness metrics',
          'Well-written, logically structured, highly relevant to Learn-to-Earn field'
        ],
        weaknesses: [
          'Limited to 12 validators - scalability claims constrained',
          'Minimal analysis of security threats (collusion, reputation manipulation)',
          'Some references appear misaligned with topic',
          'Certain equations could be clarified for consistency'
        ],
        methodologyAnalysis: 'Implementation on Hyperledger Besu and evaluation using Hyperledger Caliper are thorough, presenting clear empirical evidence.',
        noveltyAssessment: 'Significant original work and novel results. The conceptual innovation is strong and timely.',
        overallScore: 8,
        confidence: 0.90,
        recommendation: 'STRONG ACCEPT',
        evaluation: 'Despite minor weaknesses in experimental scale and security analysis, the paper\'s conceptual innovation, rigorous methodology, and excellent presentation make it a strong and timely contribution suitable for acceptance at an IEEE conference.'
      },
      isAccepted: true,
    },
  });
  console.log('✅ Human review 1 created for Paper 2');

  // Human Review 2 for Paper 2 (Accept with minor revisions)
  const user4 = await prisma.user.upsert({
    where: { email: 'reviewer4@ieee.org' },
    update: {},
    create: {
      email: 'reviewer4@ieee.org',
      name: 'Prof. F. Blockchain Research',
      role: 'reviewer',
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: 'HUMAN',
      reviewerId: user4.id,
      content: {
        summary: 'This paper proposes Proof-of-Merit (PoM), a consensus and governance framework that integrates PoA with Verifiable Random Functions (VRFs) and a dual-token model. PoM selects validators through a weighted combination of transferable stake and non-transferable academic reputation.',
        strengths: [
          'Interesting ideas and results on well-investigated subject',
          'Solid work of notable importance to educational blockchain',
          'Good practical implementation on Hyperledger Besu',
          'Promising evaluation results with Hyperledger Caliper'
        ],
        weaknesses: [
          'Only implemented on Hyperledger Besu - needs broader platform validation',
          'Practical effectiveness information could be more comprehensive',
          'Abstract differences between PDF and registration noted'
        ],
        methodologyAnalysis: 'Demonstrated implementation is sound but limited to single platform.',
        noveltyAssessment: 'Some interesting ideas but subject is well-investigated.',
        overallScore: 7,
        confidence: 0.80,
        recommendation: 'ACCEPT',
        evaluation: 'The proposed model has promising results but authors need provide more information about the effectiveness by practical implementation across multiple platforms.'
      },
      isAccepted: true,
    },
  });
  console.log('✅ Human review 2 created for Paper 2');

  // Human Review 3 for Paper 2 (Accept with minor revisions)
  const user5 = await prisma.user.upsert({
    where: { email: 'reviewer5@ieee.org' },
    update: {},
    create: {
      email: 'reviewer5@ieee.org',
      name: 'Dr. G. Consensus Protocols',
      role: 'reviewer',
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: 'HUMAN',
      reviewerId: user5.id,
      content: {
        summary: 'This paper proposes Proof-of-Merit (PoM), a consensus and governance framework integrating PoA with VRFs and a dual-token model (Stake + Reputation). Implementation on Hyperledger Besu with Caliper evaluation shows quantitative improvements over PoA and IBFT 2.0.',
        strengths: [
          'Interesting ideas on well-investigated subject',
          'Solid work with quantitative comparisons using Gini and Nakamoto coefficients',
          'Good implementation and evaluation approach'
        ],
        weaknesses: [
          'Table I could better emphasize what PoM adds beyond prior models',
          'Square-root weighting needs justification vs alternatives (log, sigmoid)',
          'Reputation weighting factors could be clearer',
          'Square-root symbol formatting issues',
          'Citation [12] appears mismatched to topic',
          'Could provide pseudocode of validator selection',
          'Discussion could expand on attack resilience'
        ],
        methodologyAnalysis: 'Sound methodology with appropriate metrics. Presentation needs minor clarification.',
        noveltyAssessment: 'Solid contribution building on existing work.',
        overallScore: 7,
        confidence: 0.85,
        recommendation: 'ACCEPT WITH MINOR REVISIONS',
        evaluation: 'There are some aspects for authors to consider when improving their final manuscript: (1) Emphasize innovation beyond prior models in Table I, (2) Explain square-root choice versus alternatives, (3) Clarify weighting factors, (4) Fix formatting, (5) Check citations, (6) Add pseudocode, (7) Expand attack resilience discussion.'
      },
      isAccepted: true,
    },
  });
  console.log('✅ Human review 3 created for Paper 2');

  console.log('\n✨ Seeding complete!');
  console.log('📄 Paper 1: Lotus Bridge (7/10 avg score)');
  console.log('📄 Paper 2: Proof-of-Merit (7.3/10 avg score)');
  console.log('👥 5 reviewers added');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
