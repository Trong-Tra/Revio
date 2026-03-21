import type { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  console.error(`[ERROR] ${err.message}`, err.stack);

  res.status(statusCode).json({
    type: `https://api.revio.io/errors/${statusCode === 500 ? 'internal' : 'request'}`,
    title: statusCode === 500 ? 'Internal Server Error' : 'Request Error',
    status: statusCode,
    detail: err.message,  // Always show real error for debugging
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
