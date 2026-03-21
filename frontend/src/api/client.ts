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

// Review Aspect for detailed reviews
export interface ReviewAspect {
  name: string;
  score: number; // 1-10
  comment?: string;
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
  
  // Final result from synthesis
  finalResult: string; // "ACCEPT", "REJECT", "MAJOR_REVISION", etc.

  // For UI display
  date: string; // createdAt formatted
  description: string; // alias for abstract
  tag1?: string; // first keyword
  tag2?: string; // second keyword

  // Conference
  conferenceId?: string;
  conferenceName?: string;
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
  agentId: string;
  text: string;
  attitude: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  createdAt: string;
  updatedAt: string;
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
  // Reputation
  reputation?: {
    tier: string;
    reviewCount: number;
    accuracyScore: number;
    overallReputation: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  affiliation?: string;
  bio?: string;
  location?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Conference {
  id: string;
  name: string;
  acronym?: string;
  tier: string;
  requiredSkills: string[];
  publisher?: string;
  website?: string;
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

// Transform paper from API to UI format
function transformPaper(paper: any): Paper {
  return {
    ...paper,
    date: new Date(paper.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    description: paper.abstract,
    tag1: paper.keywords?.[0],
    tag2: paper.keywords?.[1],
    finalResult: paper.finalResult?.toString().replace(/_/g, ' ') || 'Pending',
    conferenceName: 'Unknown Conference',
  };
}

// Auth API
export const authApi = {
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    localStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  },

  signUp: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    localStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  },

  signOut: async (): Promise<void> => {
    await fetchApi('/auth/signout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getMe: async (): Promise<User> => {
    const response = await fetchApi<User>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await fetchApi<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    localStorage.setItem('auth_user', JSON.stringify(response.data));
    return response.data;
  },
};

// Papers API
export const papersApi = {
  list: async (params?: { field?: string; search?: string; page?: number; perPage?: number }) => {
    const query = new URLSearchParams();
    if (params?.field) query.append('field', params.field);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('perPage', params.perPage.toString());
    
    const response = await fetchApi<any[]>(`/papers?${query.toString()}`);
    return {
      ...response,
      data: response.data.map(transformPaper),
    };
  },
  
  get: async (id: string) => {
    const response = await fetchApi<any>(`/papers/${id}`);
    return {
      ...response,
      data: transformPaper(response.data),
    };
  },
  
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
      conferenceId?: string;
      conferenceUrl?: string;
    }
  ): Promise<ApiResponse<Paper>> => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', metadata.title);
    formData.append('authors', JSON.stringify(metadata.authors));
    formData.append('abstract', metadata.abstract);
    formData.append('keywords', JSON.stringify(metadata.keywords));
    formData.append('field', metadata.field);
    if (metadata.doi) formData.append('doi', metadata.doi);
    if (metadata.conferenceId) formData.append('conferenceId', metadata.conferenceId);
    if (metadata.conferenceUrl) formData.append('conferenceUrl', metadata.conferenceUrl);

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

    return {
      ...data,
      data: transformPaper(data.data),
    };
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
  search: async (params: { q?: string; field?: string; sort?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.field) query.append('field', params.field);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    
    const response = await fetchApi<any[]>(`/search?${query.toString()}`);
    return {
      ...response,
      data: response.data.map(transformPaper),
    };
  },
  
  fields: () => fetchApi<{ name: string; count: number }[]>('/search/fields'),
  
  keywords: () => fetchApi<{ keyword: string; count: number }[]>('/search/keywords'),
};

// Agent Configs API
export const agentConfigsApi = {
  list: async () => {
    const response = await fetchApi<any[]>('/agent-configs');
    return {
      ...response,
      data: response.data.map((agent: any) => ({
        ...agent,
        reputation: agent.reputation || {
          tier: 'ENTRY',
          reviewCount: 0,
          accuracyScore: 0,
          overallReputation: 0,
        },
      })),
    };
  },
  
  get: async (id: string) => {
    const response = await fetchApi<any>(`/agent-configs/${id}`);
    return {
      ...response,
      data: {
        ...response.data,
        reputation: response.data.reputation || {
          tier: 'ENTRY',
          reviewCount: 0,
          accuracyScore: 0,
          overallReputation: 0,
        },
      },
    };
  },
  
  getActive: () => fetchApi<AgentConfig>('/agent-configs/active'),
  
  create: (config: Partial<AgentConfig>) =>
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
  getUserPapers: async (_userId: string): Promise<Paper[]> => {
    // Call the /my-papers endpoint which returns papers for the authenticated user
    const response = await fetchApi<{ data: Paper[] }>('/papers/my-papers');
    return response.data;
  },

  getUserReviews: async (_userId: string): Promise<Review[]> => {
    // Reviews are now simple - we get them through papers
    return [];
  },
};

// Agents API (for agent directory)
export const agentsApi = {
  list: async () => {
    const response = await agentConfigsApi.list();
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await agentConfigsApi.get(id);
    return response.data;
  },
};

// Conference API
export const conferenceApi = {
  list: () => fetchApi<Conference[]>('/conferences'),
  get: (id: string) => fetchApi<Conference>(`/conferences/${id}`),
};

export { ApiError };
