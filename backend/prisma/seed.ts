import { PrismaClient, PaperTier, AgentTier, AgentType, ReviewAttitude } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding with real published papers...');

  // Clean existing data
  await prisma.reviewSynthesis.deleteMany();
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

  // Create agent configs
  const agentConfig1 = await prisma.agentConfig.create({
    data: {
      id: 'agent-blockchain-expert',
      name: 'blockchain-expert',
      agentType: AgentType.REVIEWER,
      skillsUrl: '/SKILL.md',
      reviewUrl: '/REVIEW.md',
      fieldsUrl: '/FIELDS.md',
      ethicsUrl: '/ETHICS.md',
      tone: 'Academic',
      systemPrompt: 'You are an expert academic reviewer specializing in blockchain, distributed systems, and cryptographic protocols. Your task is to provide rigorous, objective analysis of research papers.',
      fields: ['Computer Science', 'Blockchain', 'Cryptography', 'Distributed Systems'],
      version: 1,
      isActive: true,
      description: 'Expert reviewer for blockchain and distributed systems papers',
    },
  });

  const agentConfig2 = await prisma.agentConfig.create({
    data: {
      id: 'agent-consensus-specialist',
      name: 'consensus-specialist',
      agentType: AgentType.REVIEWER,
      skillsUrl: '/SKILL.md',
      reviewUrl: '/REVIEW.md',
      fieldsUrl: '/FIELDS.md',
      ethicsUrl: '/ETHICS.md',
      tone: 'Academic',
      systemPrompt: 'You are an expert academic reviewer specializing in consensus mechanisms, distributed systems, and educational blockchain. Your task is to provide rigorous, objective analysis of research papers.',
      fields: ['Computer Science', 'Consensus Mechanisms', 'Distributed Systems', 'Educational Technology'],
      version: 1,
      isActive: true,
      description: 'Specialist reviewer for consensus mechanism papers',
    },
  });

  // Create agent reputations
  await prisma.agentReputation.create({
    data: {
      agentId: agentConfig1.id,
      tier: AgentTier.STANDARD,
      reviewCount: 5,
      accuracyScore: 85,
      helpfulnessScore: 80,
      consistencyScore: 82,
      overallReputation: 83,
      reviewsThisWeek: 2,
    },
  });

  await prisma.agentReputation.create({
    data: {
      agentId: agentConfig2.id,
      tier: AgentTier.STANDARD,
      reviewCount: 4,
      accuracyScore: 88,
      helpfulnessScore: 85,
      consistencyScore: 86,
      overallReputation: 87,
      reviewsThisWeek: 1,
    },
  });

  // Create agent skills
  const skills1 = [
    { name: 'blockchain', level: 'EXPERT', verified: true, reviewCount: 3 },
    { name: 'zero-knowledge-proofs', level: 'PROFICIENT', verified: true, reviewCount: 2 },
    { name: 'distributed-systems', level: 'EXPERT', verified: true, reviewCount: 3 },
    { name: 'cryptography', level: 'PROFICIENT', verified: true, reviewCount: 2 },
  ];

  const skills2 = [
    { name: 'blockchain', level: 'EXPERT', verified: true, reviewCount: 4 },
    { name: 'consensus-mechanisms', level: 'EXPERT', verified: true, reviewCount: 3 },
    { name: 'distributed-systems', level: 'PROFICIENT', verified: true, reviewCount: 2 },
    { name: 'governance', level: 'PROFICIENT', verified: true, reviewCount: 2 },
  ];

  for (const skill of skills1) {
    await prisma.agentSkill.create({
      data: { agentId: agentConfig1.id, ...skill },
    });
  }

  for (const skill of skills2) {
    await prisma.agentSkill.create({
      data: { agentId: agentConfig2.id, ...skill },
    });
  }

  console.log('✅ Agents created with skills and reputation');

  // Create users (human reviewers)
  const humanReviewer1 = await prisma.user.create({
    data: {
      email: 'reviewer1@ieee.org',
      name: 'Dr. A. Blockchain',
      role: 'reviewer',
      affiliation: 'University of Blockchain Research',
    },
  });

  const humanReviewer2 = await prisma.user.create({
    data: {
      email: 'reviewer2@ieee.org',
      name: 'Prof. C. Cryptography',
      role: 'reviewer',
      affiliation: 'Institute of Cryptographic Research',
    },
  });

  console.log('✅ Human reviewers created');

  // Paper 1: Lotus Bridge
  const paper1 = await prisma.paper.create({
    data: {
      id: 'paper-lotus-bridge',
      title: 'Lotus Bridge: A Hybrid Architecture for Cross-Chain Sovereign Digital Identity',
      authors: ['Tran Minh Trong', 'Tran Khanh Dang', 'Pham Nguyen Khang', 'Le Anh Cong'],
      abstract: 'This paper introduces Lotus Bridge, a hybrid decentralized identity framework that combines state-backed Proof-of-Authority credential issuance with cross-chain verification via zero-knowledge proofs. The framework establishes two fundamental protocols: state-anchored credential issuance and cross-chain privacy-preserving verification. Experimental evaluation demonstrates impressive performance with cryptographic proofs under 600 bytes, end-to-end verification latency below 2 seconds, and up to 75% cost savings compared to existing Ethereum and Polygon solutions.',
      keywords: ['Decentralized Identity', 'Cross-Chain', 'Zero-Knowledge Proofs', 'Blockchain', 'Digital Identity', 'Groth16'],
      field: 'Computer Science',
      pdfUrl: 'https://ieeexplore.ieee.org/document/11231625',
      pdfKey: 'papers/lotus-bridge.pdf',
      doi: '10.1109/Blockchain62876.2024.00031',
      rating: 7.0,
      decision: 'ACCEPT_WITH_REVISIONS',
      extractedSkills: ['blockchain', 'decentralized-identity', 'zero-knowledge-proofs', 'cross-chain', 'cryptography'],
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
      },
      assignedAgents: [agentConfig1.id, agentConfig2.id],
    },
  });

  // Reviews for Paper 1 (simplified: agentId, text, attitude)
  await prisma.review.create({
    data: {
      paperId: paper1.id,
      agentId: agentConfig1.id,
      text: `This paper presents Lotus Bridge, an innovative hybrid architecture for sovereign digital identity. 

STRENGTHS:
- Novel hybrid architecture combining state-backed PoA with cross-chain ZK verification
- Strong experimental results: <600 byte proofs, <2s latency, 75% cost reduction  
- Addresses real-world need for government-integrated DID systems
- Well-structured protocols for credential issuance and verification

WEAKNESSES:
- Groth16 trusted setup risks not adequately addressed
- Governance model lacks concrete mechanisms for validator monitoring
- Limited comparison with existing government DID systems
- No real-world deployment validation presented

OVERALL: The experimental methodology is sound and performance metrics demonstrate practical feasibility. The hybrid approach is innovative and timely, though security and governance aspects need strengthening.`,
      attitude: ReviewAttitude.POSITIVE,
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper1.id,
      agentId: humanReviewer1.id, // Human reviewers use their user ID as agentId
      text: `The paper introduces Lotus Bridge, a hybrid decentralized identity framework combining state-backed PoA with cross-chain ZK verification.

STRENGTHS:
- Innovative hybrid architecture balancing state sovereignty with decentralization
- Impressive performance: <600B proofs, <2s latency, 75% cost savings
- Addresses significant real-world problem of government-DID integration

WEAKNESSES:
- Groth16 trusted setup risks not adequately addressed  
- Governance model is abstract without concrete mechanisms
- Lacks validator monitoring and conflict resolution details

EVALUATION: Two major issues need attention. First, the Groth16 trusted setup risks need discussion on alternative proving systems. Second, the governance model lacks concrete mechanisms for validator monitoring and conflict resolution.`,
      attitude: ReviewAttitude.NEUTRAL,
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper1.id,
      agentId: humanReviewer2.id,
      text: `This paper introduces Lotus Bridge for integrating DID systems with state authorities using permissioned PoA blockchain and cross-chain ZK verification.

STRENGTHS:
- Addresses significant and relatively overlooked issue of government-DID integration
- Innovative hybrid architecture balancing state sovereignty with privacy
- Sound technical design with promising performance characteristics
- Well-structured presentation of protocols

WEAKNESSES:
- Reliance on Groth16 trusted setup introduces long-term security concerns
- Lacks comparison with existing government DID systems
- No real-world deployment validation

RECOMMENDATION: ACCEPT WITH MAJOR REVISIONS. The paper needs: (1) detailed analysis of trusted setup risks and mitigation, (2) expanded testing scale and comparison with existing systems, (3) additional governance model details.`,
      attitude: ReviewAttitude.NEUTRAL,
    },
  });

  console.log('✅ Paper 1 (Lotus Bridge) with 3 reviews created');

  // Paper 2: Proof-of-Merit
  const paper2 = await prisma.paper.create({
    data: {
      id: 'paper-proof-of-merit',
      title: 'Proof-of-Merit: A Hybrid Consensus and Governance Mechanism for Learn-to-Earn Ecosystems',
      authors: ['Tran Minh Trong', 'Tran Khanh Dang', 'Nguyen An Khuong', 'Huynh Thai Hoc'],
      abstract: 'This paper introduces Proof-of-Merit (PoM), a hybrid consensus and governance mechanism combining Proof-of-Authority, Verifiable Random Functions, and a dual-token model integrating both stake and non-transferable academic reputation. PoM selects validators through a weighted combination of transferable stake (UIT-Coin) and non-transferable academic reputation (UIT-Rep), earned via verifiable on-chain learning activities. Implementation on Hyperledger Besu demonstrates high performance and improved fairness metrics compared to existing protocols.',
      keywords: ['Consensus Mechanism', 'Proof-of-Merit', 'Learn-to-Earn', 'Educational Blockchain', 'Hyperledger Besu', 'Governance'],
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
      },
      assignedAgents: [agentConfig1.id, agentConfig2.id],
    },
  });

  // Reviews for Paper 2
  await prisma.review.create({
    data: {
      paperId: paper2.id,
      agentId: agentConfig2.id,
      text: `This paper presents Proof-of-Merit (PoM), a novel consensus mechanism combining stake and academic reputation for educational blockchains.

STRENGTHS:
- Highly original contribution combining PoA, VRFs, and dual-token model
- Strong theoretical foundation linking governance to pedagogical values
- Comprehensive evaluation using Hyperledger Caliper with quantitative fairness metrics
- Clear empirical evidence of improved fairness (lower Gini, higher Nakamoto)
- Well-written and logically structured

WEAKNESSES:
- Limited to 12 validators in experiments - scalability claims constrained
- Minimal analysis of security threats (collusion, reputation manipulation)
- Single implementation platform (Hyperledger Besu only)

OVERALL: Significant original work. The integration of academic reputation into consensus is novel and highly relevant to Learn-to-Earn ecosystems.`,
      attitude: ReviewAttitude.POSITIVE,
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper2.id,
      agentId: humanReviewer1.id,
      text: `The paper demonstrates strong originality through Proof-of-Merit, combining PoA with VRFs and a dual-token model.

STRENGTHS:
- Strong originality and technical depth in consensus design
- Innovative alignment of blockchain governance with pedagogical values
- Thorough implementation and evaluation using industry-standard tools
- Clear empirical evidence of improved fairness metrics
- Well-written, logically structured, highly relevant

WEAKNESSES:
- Limited to 12 validators - scalability claims constrained
- Minimal analysis of security threats (collusion, reputation manipulation)
- Certain equations could be clarified

RECOMMENDATION: STRONG ACCEPT. Despite minor weaknesses, the conceptual innovation and rigorous methodology make this a strong contribution.`,
      attitude: ReviewAttitude.POSITIVE,
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper2.id,
      agentId: humanReviewer2.id,
      text: `This paper proposes Proof-of-Merit, integrating PoA with VRFs and a dual-token model for educational blockchain.

STRENGTHS:
- Interesting ideas on well-investigated subject
- Solid work with quantitative comparisons using Gini and Nakamoto coefficients
- Good implementation and evaluation approach

WEAKNESSES:
- Only implemented on Hyperledger Besu - needs broader validation
- Practical effectiveness information could be more comprehensive

EVALUATION: The model has promising results but needs more information about effectiveness across multiple platforms.`,
      attitude: ReviewAttitude.NEUTRAL,
    },
  });

  console.log('✅ Paper 2 (Proof-of-Merit) with 3 reviews created');

  console.log('\n✨ Seeding complete!');
  console.log('📄 Paper 1: Lotus Bridge (IEEE Blockchain 2024) - 7/10 avg score');
  console.log('📄 Paper 2: Proof-of-Merit (IEEE COMPSAC 2024) - 7.3/10 avg score');
  console.log('🤖 2 AI agents + 2 human reviewers created');
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
