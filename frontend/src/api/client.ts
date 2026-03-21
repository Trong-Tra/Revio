const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

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

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  field: string;
  pdfUrl: string;
  pdfKey: string;
  doi?: string;
  metadata?: {
    venue?: string;
    year?: number;
    pages?: string;
    publisher?: string;
    citations?: number;
    github?: string | null;
  };
  createdAt: string;
  updatedAt: string;
  reviewCount?: number;
  confidence?: string;
  aiScore?: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  paperId: string;
  reviewerType: 'AI' | 'HUMAN';
  reviewerId?: string;
  reviewer?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: {
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
    recommendation?: string;
    evaluation?: string;
  };
  isAccepted?: boolean | null;
  confidenceScore?: number;
  createdAt: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  agentType: 'REVIEWER' | 'ANALYST' | 'CURATOR';
  skillsUrl: string;
  reviewUrl: string;
  fieldsUrl: string;
  ethicsUrl: string;
  skillsMarkdown: string;
  tone: string;
  systemPrompt: string;
  fields: string[];
  version: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  orcidId?: string;
  affiliation?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.detail || data.title || 'API Error',
      response.status,
      data
    );
  }

  return data;
}

// Auth API
export const authApi = {
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    // For now, use mock since backend auth isn't implemented
    // In production: return fetchApi<AuthResponse>('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
    
    // Mock response
    return {
      user: {
        id: 'user_123',
        email,
        name: email.split('@')[0],
        role: 'reviewer',
        createdAt: new Date().toISOString(),
      },
      token: 'mock_token_' + Math.random().toString(36).substr(2, 20),
    };
  },

  signUp: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    // For now, use mock since backend auth isn't implemented
    // In production: return fetchApi<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    
    return {
      user: {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'reviewer',
        createdAt: new Date().toISOString(),
      },
      token: 'mock_token_' + Math.random().toString(36).substr(2, 20),
    };
  },

  signOut: async (): Promise<void> => {
    // In production: await fetchApi('/auth/signout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getMe: async (): Promise<User> => {
    // In production: return fetchApi<User>('/auth/me');
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      return JSON.parse(stored);
    }
    throw new ApiError('Not authenticated', 401);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    // In production: return fetchApi<User>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) });
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const user = JSON.parse(stored);
      const updated = { ...user, ...data };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    }
    throw new ApiError('Not authenticated', 401);
  },
};

// Papers API
export const papersApi = {
  list: (params?: { field?: string; search?: string; page?: number; perPage?: number }) => {
    const query = new URLSearchParams();
    if (params?.field) query.append('field', params.field);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('perPage', params.perPage.toString());
    return fetchApi<Paper[]>(`/papers?${query.toString()}`);
  },
  
  get: (id: string) => fetchApi<Paper>(`/papers/${id}`),
  
  create: (paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt' | 'pdfUrl' | 'pdfKey'>) =>
    fetchApi<Paper>('/papers', {
      method: 'POST',
      body: JSON.stringify(paper),
    }),
  
  upload: async (
    file: File,
    metadata: {
      title: string;
      authors: string[];
      abstract: string;
      keywords: string[];
      field: string;
      doi?: string;
    }
  ): Promise<ApiResponse<Paper>> => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', metadata.title);
    formData.append('authors', metadata.authors.join(', '));
    formData.append('abstract', metadata.abstract);
    formData.append('keywords', metadata.keywords.join(', '));
    formData.append('field', metadata.field);
    if (metadata.doi) formData.append('doi', metadata.doi);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.detail || data.title || 'Upload failed',
        response.status,
        data
      );
    }

    return data;
  },
  
  update: (id: string, paper: Partial<Paper>) =>
    fetchApi<Paper>(`/papers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(paper),
    }),
  
  delete: (id: string) =>
    fetchApi<null>(`/papers/${id}`, {
      method: 'DELETE',
    }),
  
  getPdf: (id: string) => `${API_BASE_URL}/papers/${id}/pdf`,
};

// Reviews API
export const reviewsApi = {
  list: (params?: { paperId?: string; type?: 'AI' | 'HUMAN' }) => {
    const query = new URLSearchParams();
    if (params?.paperId) query.append('paperId', params.paperId);
    if (params?.type) query.append('type', params.type);
    return fetchApi<Review[]>(`/reviews?${query.toString()}`);
  },
  
  get: (id: string) => fetchApi<Review>(`/reviews/${id}`),
  
  create: (review: { paperId: string; content: any; isAccepted?: boolean }) =>
    fetchApi<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),
  
  createAI: (review: { paperId: string; content: any; confidenceScore?: number }) =>
    fetchApi<Review>('/reviews/ai', {
      method: 'POST',
      body: JSON.stringify(review),
    }),
};

// Search API
export const searchApi = {
  search: (params: { q?: string; field?: string; sort?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.field) query.append('field', params.field);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    return fetchApi<Paper[]>(`/search?${query.toString()}`);
  },
  
  fields: () => fetchApi<{ name: string; count: number }[]>('/search/fields'),
  
  keywords: () => fetchApi<{ keyword: string; count: number }[]>('/search/keywords'),
};

// Agent Configs API
export const agentConfigsApi = {
  list: () => fetchApi<AgentConfig[]>('/agent-configs'),
  
  get: (id: string) => fetchApi<AgentConfig>(`/agent-configs/${id}`),
  
  getActive: () => fetchApi<AgentConfig>('/agent-configs/active'),
  
  create: (config: Omit<AgentConfig, 'id' | 'version' | 'isActive' | 'createdAt'>) =>
    fetchApi<AgentConfig>('/agent-configs', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  
  update: (id: string, config: Partial<AgentConfig>) =>
    fetchApi<AgentConfig>(`/agent-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  
  activate: (id: string) =>
    fetchApi<AgentConfig>(`/agent-configs/${id}/activate`, {
      method: 'POST',
    }),
  
  delete: (id: string) =>
    fetchApi<null>(`/agent-configs/${id}`, {
      method: 'DELETE',
    }),
};

// User Papers API (for profile page)
export const userPapersApi = {
  getUserPapers: async (userId: string): Promise<Paper[]> => {
    // In production: return fetchApi<Paper[]>(`/users/${userId}/papers`);
    // For now, return all papers as mock
    const response = await papersApi.list();
    return response.data;
  },
  
  getUserReviews: async (userId: string): Promise<Review[]> => {
    // In production: return fetchApi<Review[]>(`/users/${userId}/reviews`);
    const response = await reviewsApi.list();
    return response.data.filter(r => r.reviewerId === userId);
  },
};

// Agents API (for agent directory)
export const agentsApi = {
  list: async (): Promise<AgentConfig[]> => {
    const response = await agentConfigsApi.list();
    return response.data;
  },
  
  get: async (id: string): Promise<AgentConfig> => {
    const response = await agentConfigsApi.get(id);
    return response.data;
  },
  
  getActive: async (): Promise<AgentConfig> => {
    const response = await agentConfigsApi.getActive();
    return response.data;
  },
};

export { ApiError };
