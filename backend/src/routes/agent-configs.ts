import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

// Validation schemas
const createConfigSchema = z.object({
  name: z.string().min(1),
  skillsMarkdown: z.string().min(1),
  tone: z.enum(['Academic', 'Constructive', 'Strict', 'Encouraging']).default('Academic'),
  systemPrompt: z.string().min(1),
});

const updateConfigSchema = z.object({
  skillsMarkdown: z.string().optional(),
  tone: z.enum(['Academic', 'Constructive', 'Strict', 'Encouraging']).optional(),
  systemPrompt: z.string().optional(),
  isActive: z.boolean().optional(),
});

// List all agent configs
router.get('/', asyncHandler(async (_req, res) => {
  const configs = await prisma.agentConfig.findMany({
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  res.json({
    success: true,
    data: configs
  });
}));

// Get active config (default for agents)
router.get('/active', asyncHandler(async (_req, res) => {
  const config = await prisma.agentConfig.findFirst({
    where: { isActive: true },
    orderBy: { version: 'desc' }
  });

  if (!config) {
    const error = new Error('No active agent config found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: config
  });
}));

// Get config by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const config = await prisma.agentConfig.findUnique({
    where: { id }
  });

  if (!config) {
    const error = new Error('Agent config not found');
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: config
  });
}));

// Create new config
router.post('/', asyncHandler(async (req, res) => {
  const validated = createConfigSchema.parse(req.body);
  
  const config = await prisma.agentConfig.create({
    data: {
      ...validated,
      version: 1,
      isActive: false, // New configs start inactive
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
  
  // Get current config
  const current = await prisma.agentConfig.findUnique({
    where: { id }
  });
  
  if (!current) {
    const error = new Error('Agent config not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Create new version with incremented version number
  const config = await prisma.agentConfig.create({
    data: {
      name: current.name,
      skillsMarkdown: validated.skillsMarkdown || current.skillsMarkdown,
      tone: validated.tone || current.tone,
      systemPrompt: validated.systemPrompt || current.systemPrompt,
      version: current.version + 1,
      isActive: validated.isActive ?? false,
    }
  });

  // If this is becoming active, deactivate others with same name
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

  // Deactivate all versions of this config name
  await prisma.agentConfig.updateMany({
    where: { name: config.name, isActive: true },
    data: { isActive: false }
  });

  // Activate this version
  const updated = await prisma.agentConfig.update({
    where: { id },
    data: { isActive: true }
  });

  res.json({
    success: true,
    data: updated
  });
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
