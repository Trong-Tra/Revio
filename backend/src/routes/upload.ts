import { Router } from 'express';
import { uploadSingle } from '../middleware/upload.js';
import { storage } from '../lib/storage.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { z } from 'zod';

const router = Router();

// Validation schema for metadata
const uploadSchema = z.object({
  title: z.string().min(1),
  authors: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  abstract: z.string().min(1),
  keywords: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  field: z.string().min(1),
  doi: z.string().optional(),
});

// Upload paper with PDF
router.post('/',
  uploadSingle,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      const error = new Error('PDF file is required');
      (error as any).statusCode = 400;
      throw error;
    }

    // Parse and validate metadata
    const validated = uploadSchema.parse(req.body);

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
        pdfUrl: uploadResult.url,
        pdfKey: uploadResult.key,
      }
    });

    res.status(201).json({
      success: true,
      data: paper,
      message: 'Paper uploaded successfully. AI review will be generated shortly.'
    });
  })
);

export { router as uploadRouter };
