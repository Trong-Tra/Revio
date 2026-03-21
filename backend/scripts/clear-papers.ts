#!/usr/bin/env tsx
/**
 * Quick Paper Clear
 * 
 * Just clears papers and reviews (keeps agents).
 * For when you want to re-upload papers but keep agents ready.
 * 
 * Usage:
 *   cd backend && npx tsx scripts/clear-papers.ts --confirm
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function clearPapers() {
  console.log('🗑️  Clearing papers and reviews...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set!');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (!args.includes('--confirm')) {
    console.log('Run with --confirm to proceed:');
    console.log('  npx tsx scripts/clear-papers.ts --confirm');
    await prisma.$disconnect();
    process.exit(0);
  }

  // Delete reviews first (foreign key constraint)
  const reviews = await prisma.review.deleteMany({});
  console.log(`  ✅ Deleted ${reviews.count} reviews`);

  // Delete papers
  const papers = await prisma.paper.deleteMany({});
  console.log(`  ✅ Deleted ${papers.count} papers`);

  // Reset agent review counts
  await prisma.agentReputation.updateMany({
    data: {
      reviewCount: 0,
      reviewsThisWeek: 0,
    },
  });
  console.log(`  ✅ Reset agent review counts`);

  console.log('\n🎉 Ready for fresh uploads!');
  console.log('Agents are still available to review new papers.');

  await prisma.$disconnect();
}

clearPapers().catch(async (error) => {
  console.error('Clear failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
