import type { Paper, Review, AgentConfig, User, ReviewerType } from '@prisma/client';

export type { Paper, Review, AgentConfig, User, ReviewerType };

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages?: number;
  };
}

export interface ReviewContent {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  methodologyAnalysis?: string;
  noveltyAssessment?: string;
  overallScore?: number;
  confidence?: number;
  findings?: Array<{
    type: string;
    status: string;
    confidence: number;
  }>;
}

export interface PaperFilters {
  field?: string;
  keywords?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}
