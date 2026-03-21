import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

// Validation schemas
const createConfigSchema = z.object({
  name: z.string().min(1),
  agentType: z.enum(['REVIEWER', 'ANALYST', 'CURATOR']).default('REVIEWER'),
  skillsUrl: z.string().default('/SKILL.md'),
  reviewUrl: z.string().default('/REVIEW.md'),
  fieldsUrl: z.string().default('/FIELDS.md'),
  ethicsUrl: z.string().default('/ETHICS.md'),
  skillsMarkdown: z.string().min(1),
  tone: z.enum(['Academic', 'Constructive', 'Strict', 'Encouraging']).default('Academic'),
  systemPrompt: z.string().min(1),
  fields: z.array(z.string()).default([]),
  description: z.string().optional(),
});

const updateConfigSchema = z.object({
  skillsMarkdown: z.string().optional(),
  tone: z.enum(['Academic', 'Constructive', 'Strict', 'Encouraging']).optional(),
  systemPrompt: z.string().optional(),
  isActive: z.boolean().optional(),
  fields: z.array(z.string()).optional(),
  description: z.string().optional(),
});

// Helper to transform agent with reputation
function transformAgent(agent: any) {
  return {
    ...agent,
    reputation: agent.reputation || {
      tier: 'ENTRY',
      reviewCount: 0,
      accuracyScore: 0,
      overallReputation: 0,
    },
    skills: agent.skills || [],
  };
}

// List all agent configs
router.get('/', asyncHandler(async (_req, res) => {
  const configs = await prisma.agentConfig.findMany({
    include: {
      // @ts-ignore
      reputation: true,
      // @ts-ignore
      skills: true,
    },
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  res.json({
    success: true,
    data: configs.map(transformAgent)
  });
}));

// Get active config (default for agents)
router.get('/active', asyncHandler(async (_req, res) => {
  const config = await prisma.agentConfig.findFirst({
    where: { isActive: true },
    include: {
      // @ts-ignore
      reputation: true,
      // @ts-ignore
      skills: true,
    },
    orderBy: { version: 'desc' }
  });

  if (!config) {
    const error = new Error('No active agent config found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: transformAgent(config)
  });
}));

// Get config by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const config = await prisma.agentConfig.findUnique({
    where: { id },
    include: {
      // @ts-ignore
      reputation: true,
      // @ts-ignore
      skills: true,
    }
  });

  if (!config) {
    const error = new Error('Agent config not found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: transformAgent(config)
  };
}));

// Create new config
router.post('/', asyncHandler(async (req, res) => {
  const validated = createConfigSchema.parse(req.body);
  
  const config = await prisma.agentConfig.create({
    data: {
      ...validated,
      version: 1,
      isActive: false,
    }
  });
  
  // Create initial reputation record
  await prisma.agentReputation.create({
    data: {
      agentId: config.id,
      tier: 'ENTRY',
    }
  });

  res.status(201).json({
    success: true,
    data: config
  });
}));

// Update config (creates new version)
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validated = updateConfigSchema.parse(req.body);
  
  const current = await prisma.agentConfig.findUnique({
    where: { id }
  });
  
  if (!current) {
    const error = new Error('Agent config not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const config = await prisma.agentConfig.create({
    data: {
      name: current.name,
      agentType: current.agentType,
      skillsUrl: current.skillsUrl,
      reviewUrl: current.reviewUrl,
      fieldsUrl: current.fieldsUrl,
      ethicsUrl: current.ethicsUrl,
      skillsMarkdown: validated.skillsMarkdown || current.skillsMarkdown,
      tone: validated.tone || current.tone,
      systemPrompt: validated.systemPrompt || current.systemPrompt,
      fields: validated.fields || current.fields,
      description: validated.description || current.description,
      version: current.version + 1,
      isActive: validated.isActive ?? false,
    }
  });

  if (config.isActive) {
    await prisma.agentConfig.updateMany({
      where: { 
        name: current.name, 
        id: { not: config.id },
        isActive: true 
      },
      data: { isActive: false }
    });
  }

  res.json({
    success: true,
    data: config
  });
}));

// Activate a config version
router.post('/:id/activate', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const config = await prisma.agentConfig.findUnique({
    where: { id }
  });
  
  if (!config) {
    const error = new Error('Agent config not found');
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.agentConfig.updateMany({
    where: { name: config.name, isActive: true },
    data: { isActive: false }
  });

  const updated = await prisma.agentConfig.update({
    where: { id },
    data: { isActive: true }
  });

  res.json({
    success: true,
    data: updated
  };
}));

// Delete config
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.agentConfig.delete({ where: { id } });

  res.json({
    success: true,
    data: null
  });
}));

export { router as agentConfigsRouter };
