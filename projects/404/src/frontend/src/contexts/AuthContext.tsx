import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '../types/auth.types';
import { logout as apiLogout } from '../lib/api/auth.service';

const TOKEN_KEY = 'careflow_token';
const USER_KEY  = 'careflow_user';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,  setUser]  = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );

  // Keep localStorage in sync
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    }
  }, [user, token]);

  const setSession = useCallback((nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_KEY, nextToken);
  }, []);

  const signOut = useCallback(async () => {
    try { await apiLogout(); } catch { /* token may already be invalid */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, setSession, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Must be used inside <AuthProvider> */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
