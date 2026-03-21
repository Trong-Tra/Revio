import { PrismaClient, PaperTier, AgentTier, AgentType, ReviewerType, ReviewDecision } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding with real published papers...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.agentReputation.deleteMany();
  await prisma.agentSkill.deleteMany();
  await prisma.agentConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.conference.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create conferences
  const blockchainConf = await prisma.conference.create({
    data: {
      id: 'conf-blockchain-2024',
      name: 'IEEE International Conference on Blockchain',
      acronym: 'Blockchain-2024',
      tier: PaperTier.STANDARD,
      publisher: 'IEEE',
      website: 'https://ieee-blockchain.org',
    },
  });

  const compsacConf = await prisma.conference.create({
    data: {
      id: 'conf-compsac-2024',
      name: 'IEEE Computers, Software, and Applications Conference',
      acronym: 'COMPSAC 2024',
      tier: PaperTier.STANDARD,
      publisher: 'IEEE',
      website: 'https://compsac.org',
    },
  });

  console.log('✅ Conferences created');

  // Create agent config
  const agentConfig = await prisma.agentConfig.create({
    data: {
      id: 'agent-default-reviewer',
      name: 'default-reviewer',
      agentType: AgentType.REVIEWER,
      skillsUrl: '/SKILL.md',
      reviewUrl: '/REVIEW.md',
      fieldsUrl: '/FIELDS.md',
      ethicsUrl: '/ETHICS.md',
      tone: 'Academic',
      systemPrompt: 'You are an expert academic reviewer specializing in blockchain, distributed systems, and cryptographic protocols. Your task is to provide rigorous, objective analysis of research papers with particular attention to technical correctness, security implications, and practical feasibility.',
      fields: ['Computer Science', 'Blockchain', 'Cryptography', 'Distributed Systems'],
      version: 1,
      isActive: true,
      description: 'Default reviewer agent for blockchain and distributed systems papers',
    },
  });

  // Create agent reputation
  await prisma.agentReputation.create({
    data: {
      agentId: agentConfig.id,
      tier: AgentTier.STANDARD,
      reviewCount: 5,
      accuracyScore: 85,
      helpfulnessScore: 80,
      consistencyScore: 82,
      overallReputation: 83,
      reviewsThisWeek: 2,
    },
  });

  // Create agent skills
  const skills = [
    { name: 'blockchain', level: 'EXPERT', verified: true, reviewCount: 3 },
    { name: 'consensus-mechanisms', level: 'EXPERT', verified: true, reviewCount: 2 },
    { name: 'zero-knowledge-proofs', level: 'PROFICIENT', verified: true, reviewCount: 2 },
    { name: 'distributed-systems', level: 'EXPERT', verified: true, reviewCount: 3 },
    { name: 'cryptography', level: 'PROFICIENT', verified: true, reviewCount: 2 },
    { name: 'smart-contracts', level: 'PROFICIENT', verified: true, reviewCount: 1 },
  ];

  for (const skill of skills) {
    await prisma.agentSkill.create({
      data: {
        agentId: agentConfig.id,
        ...skill,
      },
    });
  }

  console.log('✅ Agent created with skills and reputation');

  // Create users (reviewers)
  const reviewer1 = await prisma.user.create({
    data: {
      email: 'reviewer1@ieee.org',
      name: 'Dr. A. Blockchain',
      role: 'reviewer',
      affiliation: 'University of Blockchain Research',
    },
  });

  const reviewer2 = await prisma.user.create({
    data: {
      email: 'reviewer2@ieee.org',
      name: 'Prof. C. Cryptography',
      role: 'reviewer',
      affiliation: 'Institute of Cryptographic Research',
    },
  });

  const reviewer3 = await prisma.user.create({
    data: {
      email: 'reviewer3@ieee.org',
      name: 'Dr. E. Distributed Systems',
      role: 'reviewer',
      affiliation: 'Distributed Systems Lab',
    },
  });

  const reviewer4 = await prisma.user.create({
    data: {
      email: 'reviewer4@ieee.org',
      name: 'Prof. F. Blockchain Research',
      role: 'reviewer',
      affiliation: 'Blockchain Innovation Center',
    },
  });

  const reviewer5 = await prisma.user.create({
    data: {
      email: 'reviewer5@ieee.org',
      name: 'Dr. G. Consensus Protocols',
      role: 'reviewer',
      affiliation: 'Consensus Research Group',
    },
  });

  console.log('✅ Reviewers created');

  // Paper 1: Lotus Bridge
  const paper1 = await prisma.paper.create({
    data: {
      id: 'paper-lotus-bridge',
      title: 'Lotus Bridge: A Hybrid Architecture for Cross-Chain Sovereign Digital Identity',
      authors: ['Tran Minh Trong', 'Tran Khanh Dang', 'Pham Nguyen Khang', 'Le Anh Cong'],
      abstract: 'This paper introduces Lotus Bridge, a hybrid decentralized identity framework that combines state-backed Proof-of-Authority credential issuance with cross-chain verification via zero-knowledge proofs. The framework establishes two fundamental protocols: state-anchored credential issuance and cross-chain privacy-preserving verification. Experimental evaluation demonstrates impressive performance with cryptographic proofs under 600 bytes, end-to-end verification latency below 2 seconds, and up to 75% cost savings compared to existing Ethereum and Polygon solutions. The work addresses the critical challenge of integrating decentralized identity systems with state authorities while balancing government sovereignty requirements with user privacy and cross-chain interoperability.',
      keywords: ['Decentralized Identity', 'Cross-Chain', 'Zero-Knowledge Proofs', 'Blockchain', 'Digital Identity', 'Groth16', 'Privacy-Preserving'],
      field: 'Computer Science',
      pdfUrl: 'https://ieeexplore.ieee.org/document/11231625',
      pdfKey: 'papers/lotus-bridge.pdf',
      doi: '10.1109/Blockchain62876.2024.00031',
      rating: 7.0,
      decision: 'ACCEPT_WITH_REVISIONS',
      extractedSkills: ['blockchain', 'decentralized-identity', 'zero-knowledge-proofs', 'cross-chain', 'cryptography', 'distributed-systems'],
      requiredSkills: ['blockchain', 'cryptography', 'distributed-systems'],
      skillConfidence: 0.92,
      conferenceId: blockchainConf.id,
      tier: PaperTier.STANDARD,
      status: 'COMPLETED',
      metadata: {
        venue: 'IEEE International Conference on Blockchain (Blockchain-2024)',
        year: 2024,
        pages: '31-38',
        publisher: 'IEEE',
        citations: 0,
      },
      assignedAgents: [agentConfig.id],
    },
  });

  // AI Review for Paper 1
  await prisma.review.create({
    data: {
      paperId: paper1.id,
      reviewerType: ReviewerType.AI,
      reviewerId: null,
      content: {
        summary: 'This paper presents Lotus Bridge, an innovative hybrid architecture for sovereign digital identity that effectively bridges government credential systems with decentralized blockchain networks through zero-knowledge proofs.',
        strengths: [
          'Novel hybrid architecture combining state-backed PoA with cross-chain ZK verification',
          'Strong experimental results: <600 byte proofs, <2s latency, 75% cost reduction',
          'Addresses real-world need for government-integrated DID systems',
          'Well-structured protocols for credential issuance and verification'
        ],
        weaknesses: [
          'Groth16 trusted setup risks not adequately addressed',
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
      overallScore: 7.0,
      confidenceScore: 0.85,
      decision: ReviewDecision.WEAK_ACCEPT,
      isAccepted: null,
      aspects: [
        { name: 'Novelty', score: 8, comment: 'High novelty in hybrid approach' },
        { name: 'Methodology', score: 7, comment: 'Sound experimental design' },
        { name: 'Clarity', score: 7, comment: 'Well-structured presentation' },
        { name: 'Impact', score: 7, comment: 'Addresses real-world needs' },
        { name: 'Security', score: 6, comment: 'Trusted setup concerns' },
      ],
      agentTier: 'STANDARD',
      skillMatchScore: 0.90,
    },
  });

  // Human Review 1 for Paper 1 (Weak Accept)
  await prisma.review.create({
    data: {
      paperId: paper1.id,
      reviewerType: ReviewerType.HUMAN,
      reviewerId: reviewer1.id,
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
        recommendation: 'WEAK ACCEPT - Major revision needed for governance and security limitations before final acceptance.',
        evaluation: 'Two major issues require attention. First, the reliance on Groth16 entails trusted setup risks that could compromise security if not rigorously controlled; thus, a discussion on alternative proving systems would strengthen the paper. Second, the governance model is presented in a rather abstract manner and lacks concrete mechanisms for validator monitoring, conflict resolution, and defense against takeover attempts.'
      },
      overallScore: 6.0,
      confidenceScore: 0.82,
      decision: ReviewDecision.WEAK_ACCEPT,
      isAccepted: null,
      aspects: [
        { name: 'Novelty', score: 7, comment: 'Moderate novelty' },
        { name: 'Methodology', score: 7, comment: 'Thorough but limited scale' },
        { name: 'Clarity', score: 7, comment: 'Well-presented' },
        { name: 'Impact', score: 7, comment: 'Real-world relevance' },
        { name: 'Security', score: 5, comment: 'Trusted setup concerns' },
      ],
    },
  });

  // Human Review 2 for Paper 1 (Accept with revision)
  await prisma.review.create({
    data: {
      paperId: paper1.id,
      reviewerType: ReviewerType.HUMAN,
      reviewerId: reviewer2.id,
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
        recommendation: 'ACCEPT WITH MAJOR REVISIONS',
        evaluation: 'This paper makes a valuable contribution to an important and underexplored area of digital identity research. The hybrid architecture is innovative and addresses real-world needs for government-integrated DID systems. The paper needs major revisions focusing on: (1) more detailed analysis of trusted setup risks and mitigation strategies, (2) expanded testing scale and comparison with existing systems, (3) additional governance model details and real-world validation.'
      },
      overallScore: 7.0,
      confidenceScore: 0.88,
      decision: ReviewDecision.MAJOR_REVISION,
      isAccepted: null,
      aspects: [
        { name: 'Novelty', score: 8, comment: 'Innovative approach' },
        { name: 'Methodology', score: 7, comment: 'Sound design' },
        { name: 'Clarity', score: 8, comment: 'Well-structured' },
        { name: 'Impact', score: 8, comment: 'High real-world value' },
        { name: 'Security', score: 6, comment: 'Long-term concerns' },
      ],
    },
  });

  console.log('✅ Paper 1 (Lotus Bridge) with 3 reviews created');

  // Paper 2: Proof-of-Merit
  const paper2 = await prisma.paper.create({
    data: {
      id: 'paper-proof-of-merit',
      title: 'Proof-of-Merit: A Hybrid Consensus and Governance Mechanism for Learn-to-Earn Ecosystems',
      authors: ['Tran Minh Trong', 'Tran Khanh Dang', 'Nguyen An Khuong', 'Huynh Thai Hoc'],
      abstract: 'This paper introduces Proof-of-Merit (PoM), a hybrid consensus and governance mechanism combining Proof-of-Authority, Verifiable Random Functions, and a dual-token model integrating both stake and non-transferable academic reputation. PoM selects validators through a weighted combination of transferable stake (UIT-Coin) and non-transferable academic reputation (UIT-Rep), earned via verifiable on-chain learning activities. The mechanism addresses fairness and sustainability in educational blockchains by aligning blockchain governance with pedagogical values. Implementation on Hyperledger Besu and evaluation using Hyperledger Caliper demonstrates high performance and improved fairness metrics compared to existing protocols, with lower Gini coefficient and higher Nakamoto coefficient than PoA and IBFT 2.0.',
      keywords: ['Consensus Mechanism', 'Proof-of-Merit', 'Learn-to-Earn', 'Educational Blockchain', 'Hyperledger Besu', 'Governance', 'Reputation System'],
      field: 'Computer Science',
      pdfUrl: 'https://ieeexplore.ieee.org/document/11365043',
      pdfKey: 'papers/proof-of-merit.pdf',
      doi: '10.1109/COMPSAC61126.2024.00064',
      rating: 7.3,
      decision: 'ACCEPT',
      extractedSkills: ['blockchain', 'consensus-mechanisms', 'distributed-systems', 'governance', 'hyperledger'],
      requiredSkills: ['blockchain', 'consensus-mechanisms', 'distributed-systems'],
      skillConfidence: 0.94,
      conferenceId: compsacConf.id,
      tier: PaperTier.STANDARD,
      status: 'COMPLETED',
      metadata: {
        venue: 'IEEE 48th Annual Computers, Software, and Applications Conference (COMPSAC 2024)',
        year: 2024,
        pages: '389-398',
        publisher: 'IEEE',
        citations: 0,
      },
      assignedAgents: [agentConfig.id],
    },
  });

  // AI Review for Paper 2
  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: ReviewerType.AI,
      reviewerId: null,
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
          'Some references appear mismatched to topic'
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
      overallScore: 8.0,
      confidenceScore: 0.90,
      decision: ReviewDecision.ACCEPT,
      isAccepted: true,
      aspects: [
        { name: 'Novelty', score: 9, comment: 'Highly original contribution' },
        { name: 'Methodology', score: 8, comment: 'Rigorous evaluation' },
        { name: 'Clarity', score: 8, comment: 'Well-structured' },
        { name: 'Impact', score: 8, comment: 'Strong educational value' },
        { name: 'Security', score: 7, comment: 'Limited threat analysis' },
      ],
      agentTier: 'STANDARD',
      skillMatchScore: 0.95,
    },
  });

  // Human Review 1 for Paper 2 (Strong Accept)
  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: ReviewerType.HUMAN,
      reviewerId: reviewer3.id,
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
        recommendation: 'STRONG ACCEPT',
        evaluation: 'Despite minor weaknesses in experimental scale and security analysis, the paper\'s conceptual innovation, rigorous methodology, and excellent presentation make it a strong and timely contribution suitable for acceptance at an IEEE conference.'
      },
      overallScore: 8.0,
      confidenceScore: 0.90,
      decision: ReviewDecision.ACCEPT,
      isAccepted: true,
      aspects: [
        { name: 'Novelty', score: 9, comment: 'Significant originality' },
        { name: 'Methodology', score: 8, comment: 'Thorough evaluation' },
        { name: 'Clarity', score: 8, comment: 'Well-written' },
        { name: 'Impact', score: 8, comment: 'Highly relevant' },
        { name: 'Security', score: 7, comment: 'Needs more analysis' },
      ],
    },
  });

  // Human Review 2 for Paper 2 (Accept)
  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: ReviewerType.HUMAN,
      reviewerId: reviewer4.id,
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
        recommendation: 'ACCEPT',
        evaluation: 'The proposed model has promising results but authors need provide more information about the effectiveness by practical implementation across multiple platforms.'
      },
      overallScore: 7.0,
      confidenceScore: 0.80,
      decision: ReviewDecision.ACCEPT,
      isAccepted: true,
      aspects: [
        { name: 'Novelty', score: 7, comment: 'Interesting approach' },
        { name: 'Methodology', score: 7, comment: 'Sound implementation' },
        { name: 'Clarity', score: 7, comment: 'Acceptable presentation' },
        { name: 'Impact', score: 7, comment: 'Educational value' },
        { name: 'Security', score: 7, comment: 'Standard analysis' },
      ],
    },
  });

  // Human Review 3 for Paper 2 (Accept with minor revisions)
  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerType: ReviewerType.HUMAN,
      reviewerId: reviewer5.id,
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
        recommendation: 'ACCEPT WITH MINOR REVISIONS',
        evaluation: 'There are some aspects for authors to consider when improving their final manuscript: (1) Emphasize innovation beyond prior models in Table I, (2) Explain square-root choice versus alternatives, (3) Clarify weighting factors, (4) Fix formatting, (5) Check citations, (6) Add pseudocode, (7) Expand attack resilience discussion.'
      },
      overallScore: 7.0,
      confidenceScore: 0.85,
      decision: ReviewDecision.MINOR_REVISION,
      isAccepted: true,
      aspects: [
        { name: 'Novelty', score: 7, comment: 'Solid contribution' },
        { name: 'Methodology', score: 8, comment: 'Appropriate metrics' },
        { name: 'Clarity', score: 7, comment: 'Minor clarifications needed' },
        { name: 'Impact', score: 7, comment: 'Good educational value' },
        { name: 'Security', score: 7, comment: 'Expand attack resilience' },
      ],
    },
  });

  console.log('✅ Paper 2 (Proof-of-Merit) with 4 reviews created');

  console.log('\n✨ Seeding complete!');
  console.log('📄 Paper 1: Lotus Bridge (IEEE Blockchain 2024) - 7/10 avg score');
  console.log('📄 Paper 2: Proof-of-Merit (IEEE COMPSAC 2024) - 7.3/10 avg score');
  console.log('👥 5 reviewers + 1 agent created');
  console.log('🏛️ 2 conferences created');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
