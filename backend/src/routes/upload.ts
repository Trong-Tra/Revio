import { Router } from 'express';
import { uploadSingle } from '../middleware/upload.js';
import { storage } from '../lib/storage.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { extractConferenceInfo, upsertConferenceFromExtraction } from '../services/conferenceDiscovery.js';

const router = Router();

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

// Upload paper with PDF (requires authentication)
router.post('/',
  requireAuth,
  uploadSingle,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) {
      const error = new Error('PDF file is required');
      (error as any).statusCode = 400;
      throw error;
    }
    
    const userId = req.userId;

    // Parse and validate metadata
    const validated = uploadSchema.parse(req.body);

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
    const uploadResult = await storage.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Create paper record
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
