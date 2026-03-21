import { useState, useCallback, useEffect } from 'react';
import { authApi, type User } from '../api/client';

const AUTH_CHANGED_EVENT = 'auth-changed';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Initialize from localStorage or null
const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(getInitialUser());
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
      const response = await authApi.signIn(email, password);
      
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signUp(name, email, password);
      
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.signOut();
      setUser(null);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(data);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
