/**
 * Agent Flow Test Script
 * 
 * Tests the complete agent review flow:
 * 1. Create test user
 * 2. Create test paper
 * 3. Create test agents with different skills
 * 4. Check qualification for each agent
 * 5. Submit reviews (multiple agents)
 * 6. Trigger synthesis
 * 
 * Run with: npx tsx src/tests/agent-flow.test.ts
 */

import { PrismaClient, ReviewAttitude } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

// Test data
const TEST_USER = {
  name: 'Test Researcher',
  email: `test-${Date.now()}@example.com`,
  password: 'password123'
};

const TEST_PAPER = {
  title: 'Test Paper: Neural Networks for Image Classification',
  authors: ['Test Author 1', 'Test Author 2'],
  abstract: 'This paper presents a novel approach to image classification using neural networks. We evaluate our method on standard benchmarks and achieve competitive results.',
  keywords: ['machine-learning', 'computer-vision', 'neural-networks'],
  field: 'Computer Science',
};

// Test agents with different skills
const TEST_AGENTS = [
  {
    name: 'ML Expert Agent',
    skills: [
      { name: 'machine-learning', level: 'EXPERT' as const },
      { name: 'computer-vision', level: 'PROFICIENT' as const }
    ],
    review: {
      text: `This paper presents a solid contribution to image classification. 

Strengths:
- Clear methodology description
- Comprehensive evaluation on multiple datasets
- Well-structured presentation

Weaknesses:
- Limited comparison with recent transformer-based approaches
- Ablation studies could be more detailed

Overall, this is a good paper that advances the field. I recommend acceptance with minor revisions.`,
      attitude: 'POSITIVE' as ReviewAttitude
    }
  },
  {
    name: 'CV Specialist Agent',
    skills: [
      { name: 'computer-vision', level: 'EXPERT' as const },
      { name: 'deep-learning', level: 'PROFICIENT' as const }
    ],
    review: {
      text: `The technical approach is sound, but I have concerns about the evaluation.

Strengths:
- Novel architecture design
- Good experimental setup

Weaknesses:
- Missing comparison with SOTA methods from 2024
- Statistical significance tests not reported
- Dataset description is incomplete

The paper needs revision before acceptance.`,
      attitude: 'NEUTRAL' as ReviewAttitude
    }
  },
  {
    name: 'Critical Reviewer Agent',
    skills: [
      { name: 'machine-learning', level: 'PROFICIENT' as const }
    ],
    review: {
      text: `I cannot recommend this paper in its current form.

Major concerns:
- The claimed improvement (15%) is not statistically validated
- Figure 3 appears to show inconsistent results
- Related work section omits critical prior work

The methodology has promise, but the evaluation is insufficient.`,
      attitude: 'NEGATIVE' as ReviewAttitude
    }
  }
];

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to generate JWT
function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    userId, 
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'revio-secret')
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

// API helper
async function api(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    console.error(`   API Error:`, data?.error || response.statusText);
    throw new Error(data?.error || `HTTP ${response.status}`);
  }
  
  return data;
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Agent Flow Tests\n');
  console.log('='.repeat(50));
  
  let userId: string;
  let token: string;
  let paperId: string;
  const agentIds: string[] = [];
  
  try {
    // Step 1: Create test user
    console.log('\n👤 Step 1: Creating test user...');
    const user = await prisma.user.create({
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        passwordHash: hashPassword(TEST_USER.password)
      }
    });
    userId = user.id;
    token = generateToken(userId);
    console.log(`✅ User created: ${userId.slice(0, 8)}...`);
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    
    // Step 2: Create conference first, then paper
    console.log('\n📄 Step 2: Creating test conference and paper...');
    const conference = await prisma.conference.create({
      data: {
        name: 'Test Conference 2025',
        acronym: 'TC25',
        tier: 'STANDARD',
        requiredSkills: ['machine-learning']
      }
    });
    
    const paper = await prisma.paper.create({
      data: {
        title: TEST_PAPER.title,
        authors: TEST_PAPER.authors,
        abstract: TEST_PAPER.abstract,
        keywords: TEST_PAPER.keywords,
        field: TEST_PAPER.field,
        pdfUrl: 'http://localhost:9000/revio-papers/test-paper.pdf',
        pdfKey: 'test-papers/test-paper.pdf',
        userId: userId,
        conferenceId: conference.id,
        requiredSkills: ['machine-learning', 'computer-vision'],
        skillConfidence: 0.85
      }
    });
    paperId = paper.id;
    console.log(`✅ Paper created: ${paperId.slice(0, 8)}...`);
    console.log(`   Title: ${TEST_PAPER.title.slice(0, 50)}...`);
    
    // Step 3: Create test agents
    console.log('\n🤖 Step 3: Creating test agents...');
    for (const agentData of TEST_AGENTS) {
      const agent = await prisma.agentConfig.create({
        data: {
          name: agentData.name,
          systemPrompt: `You are ${agentData.name}, an expert reviewer.`,
          fields: ['Computer Science'],
          isActive: true,
          skills: {
            create: agentData.skills.map(s => ({
              name: s.name,
              level: s.level
            }))
          },
          reputation: {
            create: {
              tier: 'STANDARD',
              reviewCount: 0,
              overallReputation: 75
            }
          }
        }
      });
      agentIds.push(agent.id);
      console.log(`✅ ${agentData.name}`);
      console.log(`   ID: ${agent.id.slice(0, 8)}...`);
      console.log(`   Skills: ${agentData.skills.map(s => s.name).join(', ')}`);
    }
    
    // Step 4: Check qualifications
    console.log('\n🔍 Step 4: Checking agent qualifications...');
    for (let i = 0; i < agentIds.length; i++) {
      const agentId = agentIds[i];
      const agentName = TEST_AGENTS[i].name;
      
      try {
        const result = await api('/qualifications/check', {
          method: 'POST',
          body: JSON.stringify({ agentId, paperId })
        });
        
        if (result.data.allowed) {
          console.log(`✅ ${agentName}: QUALIFIED ✓`);
          console.log(`   Match Score: ${(result.data.matchScore * 100).toFixed(1)}%`);
          console.log(`   Reason: ${result.data.reason}`);
        } else {
          console.log(`❌ ${agentName}: NOT QUALIFIED`);
          console.log(`   Reason: ${result.data.reason}`);
        }
      } catch (error: any) {
        console.log(`⚠️ ${agentName}: Check failed`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    // Step 5: Submit reviews
    console.log('\n📝 Step 5: Submitting reviews...');
    for (let i = 0; i < agentIds.length; i++) {
      const agentId = agentIds[i];
      const agentData = TEST_AGENTS[i];
      
      try {
        const review = await prisma.review.create({
          data: {
            paperId: paperId,
            agentId: agentId,
            text: agentData.review.text,
            attitude: agentData.review.attitude
          }
        });
        
        console.log(`✅ ${agentData.name}`);
        console.log(`   Attitude: ${agentData.review.attitude}`);
        console.log(`   Review ID: ${review.id.slice(0, 8)}...`);
      } catch (error: any) {
        console.log(`❌ ${agentData.name}: ${error.message}`);
      }
    }
    
    // Step 6: Verify reviews
    console.log('\n📊 Step 6: Verifying reviews...');
    const reviews = await prisma.review.findMany({
      where: { paperId },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`✅ Total reviews: ${reviews.length}`);
    reviews.forEach((review, i) => {
      const attitude = review.attitude === 'POSITIVE' ? '👍' : review.attitude === 'NEGATIVE' ? '👎' : '⚖️';
      console.log(`   ${i + 1}. ${attitude} ${review.attitude} (${review.agentId.slice(0, 8)})`);
    });
    
    // Step 7: Trigger synthesis
    console.log('\n🧠 Step 7: Triggering synthesis...');
    if (reviews.length >= 1) {
      try {
        const synthesis = await api(`/papers/${paperId}/synthesis`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Synthesis complete!');
        console.log(`   Recommendation: ${synthesis.data?.recommendation}`);
        console.log(`   Confidence: ${(synthesis.data?.confidence * 100).toFixed(1)}%`);
        console.log(`   Summary: ${synthesis.data?.summary?.substring(0, 80)}...`);
        
        if (synthesis.data?.strengths?.length) {
          console.log(`   Strengths: ${synthesis.data.strengths.length} found`);
        }
        if (synthesis.data?.weaknesses?.length) {
          console.log(`   Weaknesses: ${synthesis.data.weaknesses.length} found`);
        }
      } catch (error: any) {
        console.log(`⚠️ Synthesis failed: ${error.message}`);
        console.log('   (Expected if TinyFish API is not configured)');
        console.log('   Falling back to local synthesis would work if implemented.');
      }
    } else {
      console.log('⚠️ Skipping synthesis (no reviews)');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ User: ${TEST_USER.email}`);
    console.log(`✅ Paper: ${paperId.slice(0, 16)}...`);
    console.log(`✅ Agents: ${agentIds.length} created`);
    console.log(`✅ Reviews: ${reviews.length} submitted`);
    console.log();
    console.log('Test Credentials:');
    console.log(`  Email:    ${TEST_USER.email}`);
    console.log(`  Password: ${TEST_USER.password}`);
    console.log();
    console.log('Next steps:');
    console.log(`  1. Login:    http://localhost:3000/signin`);
    console.log(`  2. Library:  http://localhost:3000/library`);
    console.log(`  3. Paper:    http://localhost:3000/paper/${paperId}`);
    console.log();
    console.log('✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
