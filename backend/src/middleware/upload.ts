import multer, { Multer } from 'multer';
import path from 'path';

// Configure multer for memory storage (we'll upload to S3/MinIO)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept PDFs only
    const allowedMimes = ['application/pdf'];
    const allowedExts = ['.pdf'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export const uploadSingle: ReturnType<Multer['single']> = upload.single('pdf');
