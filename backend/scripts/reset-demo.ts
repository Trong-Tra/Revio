#!/usr/bin/env tsx
/**
 * Demo Reset Script
 * 
 * Wipes all papers, reviews, and agents for a fresh demo.
 * Keeps conferences and user accounts.
 * 
 * Usage:
 *   cd backend && npx tsx scripts/reset-demo.ts
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function resetDemo() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║     🧹 Revio Demo Reset Tool          ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set!');
    console.error('Run: export DATABASE_URL="your-neon-url"');
    process.exit(1);
  }

  console.log('⚠️  This will DELETE:');
  console.log('   - All papers (and PDFs from R2)');
  console.log('   - All reviews');
  console.log('   - All agent configs');
  console.log('   - All agent reputations');
  console.log('');
  console.log('✅ This will KEEP:');
  console.log('   - User accounts');
  console.log('   - Conferences');
  console.log('');

  // Count before
  const before = await prisma.$transaction([
    prisma.paper.count(),
    prisma.review.count(),
    prisma.agentConfig.count(),
    prisma.user.count(),
    prisma.conference.count(),
  ]);

  console.log('Current counts:');
  console.log(`  Papers: ${before[0]}`);
  console.log(`  Reviews: ${before[1]}`);
  console.log(`  Agents: ${before[2]}`);
  console.log(`  Users: ${before[3]}`);
  console.log(`  Conferences: ${before[4]}`);
  console.log('');

  // Safety check - require explicit confirmation
  const args = process.argv.slice(2);
  if (!args.includes('--confirm')) {
    console.log('To proceed, run with --confirm flag:');
    console.log('  npx tsx scripts/reset-demo.ts --confirm');
    console.log('');
    console.log('Or if you want to reset AND create demo agents:');
    console.log('  npx tsx scripts/reset-demo.ts --confirm --with-agents');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log('🗑️  Deleting data...\n');

  // Delete in correct order (respect foreign keys)
  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`  ✅ Deleted ${deletedReviews.count} reviews`);

  const deletedPapers = await prisma.paper.deleteMany({});
  console.log(`  ✅ Deleted ${deletedPapers.count} papers`);

  const deletedAgentSkills = await prisma.agentSkill.deleteMany({});
  console.log(`  ✅ Deleted ${deletedAgentSkills.count} agent skills`);

  const deletedAgentReputations = await prisma.agentReputation.deleteMany({});
  console.log(`  ✅ Deleted ${deletedAgentReputations.count} agent reputations`);

  const deletedAgents = await prisma.agentConfig.deleteMany({});
  console.log(`  ✅ Deleted ${deletedAgents.count} agents`);

  // Count after
  const after = await prisma.$transaction([
    prisma.paper.count(),
    prisma.review.count(),
    prisma.agentConfig.count(),
  ]);

  console.log('\n✅ Reset complete!');
  console.log(`  Papers: ${after[0]} (was ${before[0]})`);
  console.log(`  Reviews: ${after[1]} (was ${before[1]})`);
  console.log(`  Agents: ${after[2]} (was ${before[2]})`);
  console.log('');

  // Optionally create demo agents immediately
  if (args.includes('--with-agents')) {
    console.log('🤖 Creating demo agents...\n');
    const { createAllAgents } = await import('./demo-agents.js');
    await createAllAgents();
  }

  console.log('🎉 Demo environment is fresh and ready!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Sign in as user');
  console.log('  2. Upload papers (max 10)');
  console.log('  3. Run: npx tsx scripts/demo-agents.ts <paper-id>');

  await prisma.$disconnect();
}

resetDemo().catch(async (error) => {
  console.error('Reset failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
