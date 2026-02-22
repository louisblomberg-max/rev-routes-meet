import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string | null;
  isProfileComplete: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('revnet_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('revnet_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('revnet_user');
    }
  }, [user]);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call — will be replaced by Supabase auth
    await new Promise(r => setTimeout(r, 800));
    setUser({
      id: crypto.randomUUID(),
      email,
      displayName: email.split('@')[0],
      avatar: null,
      isProfileComplete: true,
    });
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, _password: string, displayName: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({
      id: crypto.randomUUID(),
      email,
      displayName,
      avatar: null,
      isProfileComplete: false,
    });
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('revnet_user');
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      resetPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
