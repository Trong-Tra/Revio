import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = Router();

// Get current file directory (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const skillsDir = join(__dirname, '..', 'skills');

// Skill files mapping
const skillFiles: Record<string, string> = {
  'SKILL.md': 'SKILL.md',
  'REVIEW.md': 'REVIEW.md',
  'FIELDS.md': 'FIELDS.md',
  'ETHICS.md': 'ETHICS.md',
  'package.json': 'package.json',
};

// Get skill file content
const getSkillFile = (filename: string): string | null => {
  const filepath = join(skillsDir, filename);
  try {
    return readFileSync(filepath, 'utf-8');
  } catch {
    return null;
  }
};

// Main skill file
router.get('/SKILL.md', (_req, res) => {
  const content = getSkillFile('SKILL.md');
  if (!content) {
    res.status(404).json({ error: 'Skill file not found' });
    return;
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(content);
});

// Review methodology
router.get('/REVIEW.md', (_req, res) => {
  const content = getSkillFile('REVIEW.md');
  if (!content) {
    res.status(404).json({ error: 'Review file not found' });
    return;
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(content);
});

// Field-specific guidelines
router.get('/FIELDS.md', (_req, res) => {
  const content = getSkillFile('FIELDS.md');
  if (!content) {
    res.status(404).json({ error: 'Fields file not found' });
    return;
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(content);
});

// Ethics and anti-hallucination rules
router.get('/ETHICS.md', (_req, res) => {
  const content = getSkillFile('ETHICS.md');
  if (!content) {
    res.status(404).json({ error: 'Ethics file not found' });
    return;
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(content);
});

// Package metadata
router.get('/package.json', (_req, res) => {
  const content = getSkillFile('package.json');
  if (!content) {
    res.status(404).json({ error: 'Package file not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(content);
});

// Index / list all skills
router.get('/', (_req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/skills`;
  
  res.json({
    name: 'revio',
    version: '1.0.0',
    description: 'The collaborative research platform for AI-assisted peer review',
    homepage: 'https://revio.io',
    skills: {
      'SKILL.md': `${baseUrl}/SKILL.md`,
      'REVIEW.md': `${baseUrl}/REVIEW.md`,
      'FIELDS.md': `${baseUrl}/FIELDS.md`,
      'ETHICS.md': `${baseUrl}/ETHICS.md`,
      'package.json': `${baseUrl}/package.json`,
    },
    install: `mkdir -p ~/.revio/skills && curl -s ${baseUrl}/SKILL.md > ~/.revio/skills/SKILL.md && curl -s ${baseUrl}/REVIEW.md > ~/.revio/skills/REVIEW.md && curl -s ${baseUrl}/FIELDS.md > ~/.revio/skills/FIELDS.md && curl -s ${baseUrl}/ETHICS.md > ~/.revio/skills/ETHICS.md`,
  });
});

export { router as skillsRouter };
