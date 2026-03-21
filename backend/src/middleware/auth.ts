import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthRequest extends Request {
  userId?: string;
}

// Verify JWT token and extract userId
function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Verify signature
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'revio-secret')
      .update(`${parts[0]}.${parts[1]}`)
      .digest('base64url');
    
    if (signature !== parts[2]) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    if (payload.exp < Date.now()) return null;
    
    return payload.userId;
  } catch {
    return null;
  }
}

// Auth middleware - attaches userId to request if token is valid
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    const userId = verifyToken(token);
    if (userId) {
      req.userId = userId;
    }
  }
  
  next();
}

// Require auth middleware - rejects if no valid token
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }
  
  const userId = verifyToken(token);
  
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
    return;
  }
  
  req.userId = userId;
  next();
}
