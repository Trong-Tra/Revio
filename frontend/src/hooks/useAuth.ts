import { useState, useCallback, useEffect } from 'react';

const AUTH_CHANGED_EVENT = 'auth-changed';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  orcidId?: string;
  affiliation?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

// Initialize from localStorage or null
const getInitialUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser());
  const [isLoading, setIsLoading] = useState(false);

  // Keep auth state in sync across components and tabs.
  useEffect(() => {
    const syncUserFromStorage = () => {
      setUser(getInitialUser());
    };

    syncUserFromStorage();
    window.addEventListener(AUTH_CHANGED_EVENT, syncUserFromStorage);
    window.addEventListener('storage', syncUserFromStorage);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUserFromStorage);
      window.removeEventListener('storage', syncUserFromStorage);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/signin', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // Mock authentication
      const mockUser: AuthUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        affiliation: 'Your Institution',
      };

      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'token_' + Math.random().toString(36).substr(2, 20));
      setUser(mockUser);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });
      // const data = await response.json();

      // Mock registration
      const mockUser: AuthUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        affiliation: '',
      };

      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'token_' + Math.random().toString(36).substr(2, 20));
      setUser(mockUser);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Call logout API
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      setUser(null);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      //   },
      //   body: JSON.stringify(data),
      // });

      const updatedUser = { ...user, ...data } as AuthUser;
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};
