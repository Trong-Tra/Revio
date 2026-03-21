import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router: Router = Router();

// Helper to transform agent config for response
function transformAgent(agent: any, reputation?: any, skills?: any[]) {
  return {
    id: agent.id,
    name: agent.name,
    agentType: agent.agentType,
    skillsUrl: agent.skillsUrl,
    reviewUrl: agent.reviewUrl,
    fieldsUrl: agent.fieldsUrl,
    ethicsUrl: agent.ethicsUrl,
    tone: agent.tone,
    systemPrompt: agent.systemPrompt,
    fields: agent.fields,
    version: agent.version,
    isActive: agent.isActive,
    description: agent.description,
    createdAt: agent.createdAt,
    reputation: reputation || {
      tier: 'ENTRY',
      reviewCount: 0,
      accuracyScore: 0,
      overallReputation: 0,
    },
    skills: skills || [],
  };
}

// List all agent configs
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const configs = await prisma.agentConfig.findMany({
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  // Fetch reputation and skills for each config
  const agentIds = configs.map(c => c.id);
  const [reputations, skills] = await Promise.all([
    prisma.agentReputation.findMany({
      where: { agentId: { in: agentIds } }
    }),
    prisma.agentSkill.findMany({
      where: { agentId: { in: agentIds } }
    })
  ]);

  const reputationMap = new Map(reputations.map(r => [r.agentId, r]));
  const skillsMap = new Map();
  skills.forEach(s => {
    if (!skillsMap.has(s.agentId)) skillsMap.set(s.agentId, []);
    skillsMap.get(s.agentId).push(s);
  });

  res.json({
    success: true,
    data: configs.map(config => transformAgent(
      config,
      reputationMap.get(config.id),
      skillsMap.get(config.id)
    ))
  });
}));

// Get active config (default for agents)
router.get('/active', asyncHandler(async (_req: Request, res: Response) => {
  const config = await prisma.agentConfig.findFirst({
    where: { isActive: true },
    orderBy: { version: 'desc' }
  });

  if (!config) {
    const error = new Error('No active agent config found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Fetch reputation and skills
  const [reputation, skills] = await Promise.all([
    prisma.agentReputation.findUnique({
      where: { agentId: config.id }
    }),
    prisma.agentSkill.findMany({
      where: { agentId: config.id }
    })
  ]);

  res.json({
    success: true,
    data: transformAgent(config, reputation, skills)
  });
}));

// Get config by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  const config = await prisma.agentConfig.findUnique({
    where: { id }
  });

  if (!config) {
    const error = new Error('Agent config not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Fetch reputation and skills
  const [reputation, skills] = await Promise.all([
    prisma.agentReputation.findUnique({
      where: { agentId: config.id }
    }),
    prisma.agentSkill.findMany({
      where: { agentId: config.id }
    })
  ]);

  res.json({
    success: true,
    data: transformAgent(config, reputation, skills)
  });
}));

// Create new config
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const config = await prisma.agentConfig.create({
    data: req.body
  });

  res.status(201).json({
    success: true,
    data: config
  });
}));

// Update config
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  const config = await prisma.agentConfig.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    data: config
  });
}));

// Delete config
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  await prisma.agentConfig.delete({ where: { id } });

  res.json({
    success: true,
    data: null
  });
}));

// Activate config (deactivate others)
router.post('/:id/activate', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  await prisma.$transaction([
    prisma.agentConfig.updateMany({
      data: { isActive: false }
    }),
    prisma.agentConfig.update({
      where: { id },
      data: { isActive: true, version: { increment: 1 } }
    })
  ]);

  const config = await prisma.agentConfig.findUnique({
    where: { id }
  });

  res.json({
    success: true,
    data: config
  });
}));

export { router as agentConfigsRouter };
