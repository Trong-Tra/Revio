import { Router, Response } from 'express';
import { uploadSingle } from '../middleware/upload.js';
import { storage } from '../lib/storage.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { extractConferenceInfo, upsertConferenceFromExtraction } from '../services/conferenceDiscovery.js';

const router: Router = Router();

// Validation schema for metadata
const uploadSchema = z.object({
  title: z.string().min(1),
  authors: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  abstract: z.string().min(1),
  keywords: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  field: z.string().min(1),
  doi: z.string().optional(),
  conferenceId: z.string().optional(),
  conferenceUrl: z.string().optional(), // New: URL for TinyFish to scrape
});

// HACKATHON MVP: Max 10 papers limit
const MAX_PAPERS = 10;

// Upload paper with PDF (requires authentication)
router.post('/',
  requireAuth,
  uploadSingle,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('[Upload] Request received');
    console.log('[Upload] User:', req.userId);
    console.log('[Upload] File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
    console.log('[Upload] Body:', req.body);
    
    if (!req.file) {
      const error = new Error('PDF file is required');
      (error as any).statusCode = 400;
      throw error;
    }
    
    const userId = req.userId;

    // HACKATHON: Check paper limit
    const paperCount = await prisma.paper.count();
    console.log(`[Upload] Current paper count: ${paperCount}/${MAX_PAPERS}`);
    if (paperCount >= MAX_PAPERS) {
      const error = new Error(
        `Hackathon MVP limit: Maximum ${MAX_PAPERS} papers allowed. ` +
        `Please delete an existing paper before uploading.`
      );
      (error as any).statusCode = 403;
      throw error;
    }

    // Parse and validate metadata
    console.log('[Upload] Validating metadata...');
    let validated;
    try {
      validated = uploadSchema.parse(req.body);
      console.log('[Upload] Validation passed:', validated);
    } catch (validationError: any) {
      console.error('[Upload] Validation failed:', validationError.errors);
      throw validationError;
    }

    // Handle conference assignment
    let conferenceId = validated.conferenceId;
    let conferenceSource = 'existing';

    // If no conferenceId but URL provided, use TinyFish to extract
    if (!conferenceId && validated.conferenceUrl) {
      console.log(`[Upload] Extracting conference from URL: ${validated.conferenceUrl}`);
      const extraction = await extractConferenceInfo(validated.conferenceUrl);
      
      const conference = await upsertConferenceFromExtraction(
        prisma,
        validated.conferenceUrl,
        extraction
      );
      
      conferenceId = conference.id;
      conferenceSource = extraction.found ? 'extracted' : 'independent';
      
      console.log(`[Upload] Conference ${extraction.found ? 'found' : 'not found'}, using: ${conference.name}`);
    }

    // If still no conference, default to independent
    if (!conferenceId) {
      const independentConf = await prisma.conference.upsert({
        where: { id: 'conf-independent' },
        create: {
          id: 'conf-independent',
          name: 'Independent Submission',
          acronym: 'IND',
          tier: 'ENTRY',
          requiredSkills: [],
        },
        update: {},
      });
      conferenceId = independentConf.id;
      conferenceSource = 'independent';
    }

    // Upload PDF to storage
    console.log('[Upload] Uploading to R2...');
    const uploadResult = await storage.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    console.log('[Upload] R2 upload successful:', uploadResult.url.substring(0, 60) + '...');

    // Create paper record
    console.log('[Upload] Creating paper in database...');
    const paper = await prisma.paper.create({
      data: {
        title: validated.title,
        authors: validated.authors,
        abstract: validated.abstract,
        keywords: validated.keywords,
        field: validated.field,
        doi: validated.doi || null,
        conferenceId: conferenceId,
        pdfUrl: uploadResult.url,
        pdfKey: uploadResult.key,
        userId: userId!,
      },
    });
    console.log('[Upload] Paper created:', paper.id);
    
    // Get conference name separately
    const conference = conferenceId 
      ? await prisma.conference.findUnique({ where: { id: conferenceId } })
      : null;

    res.status(201).json({
      success: true,
      data: paper,
      meta: {
        conferenceSource,
        conferenceName: conference?.name || 'Independent Submission',
      },
      message: conferenceSource === 'extracted' 
        ? 'Paper uploaded successfully. Conference details extracted and verified.'
        : 'Paper uploaded successfully. AI review will be generated shortly.'
    });
  })
);

export { router as uploadRouter };
