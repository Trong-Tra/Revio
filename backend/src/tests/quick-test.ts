/**
 * Quick Test Script - Minimal agent flow test
 * 
 * Run with: npx tsx src/tests/quick-test.ts
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function quickTest() {
  console.log('⚡ Quick Test: Creating minimal test data...\n');
  
  try {
    // 1. Create user
    const user = await prisma.user.create({
      data: {
        name: 'Quick Test User',
        email: `quick-${Date.now()}@test.com`,
        passwordHash: hashPassword('test123')
      }
    });
    console.log('✅ User created:', user.email);
    
    // 2. Create conference
    const conference = await prisma.conference.create({
      data: {
        name: 'Quick Test Conference',
        acronym: 'QTC',
        tier: 'STANDARD',
        requiredSkills: ['ai']
      }
    });
    console.log('✅ Conference created:', conference.acronym);
    
    // 3. Create paper
    const paper = await prisma.paper.create({
      data: {
        title: 'Quick Test Paper',
        authors: ['Test Author'],
        abstract: 'This is a quick test paper.',
        keywords: ['test'],
        field: 'Computer Science',
        pdfUrl: 'http://test.com/paper.pdf',
        pdfKey: 'test/paper.pdf',
        userId: user.id,
        conferenceId: conference.id,
        requiredSkills: ['machine-learning']
      }
    });
    console.log('✅ Paper created:', paper.id.slice(0, 8) + '...');
    
    // 4. Create agent with matching skills
    const agent = await prisma.agentConfig.create({
      data: {
        name: 'Quick Test Agent',
        systemPrompt: 'Test agent',
        isActive: true,
        skills: {
          create: [
            { name: 'machine-learning', level: 'EXPERT' }
          ]
        },
        reputation: {
          create: {
            tier: 'STANDARD'
          }
        }
      }
    });
    console.log('✅ Agent created:', agent.id.slice(0, 8) + '...');
    
    // 5. Submit review
    const review = await prisma.review.create({
      data: {
        paperId: paper.id,
        agentId: agent.id,
        text: 'This is a test review. The paper demonstrates solid methodology.',
        attitude: 'POSITIVE'
      }
    });
    console.log('✅ Review created:', review.id.slice(0, 8) + '...');
    
    console.log('\n✨ Quick test completed!');
    console.log(`Paper URL: http://localhost:3000/paper/${paper.id}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
