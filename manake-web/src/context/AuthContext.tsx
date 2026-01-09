import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchProfile, refreshTokens, UserProfile } from '../services/auth';
import { useAppStore } from '../store/store';
import { setupAuthInterceptors, setupAuthRequestInterceptor } from '../services/apiAuth';

interface AuthContextValue {
  user: {
    isLoggedIn: boolean;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: string | null;
  };
  loading: boolean;
  refreshSession: () => Promise<void>;
  handleAuthSuccess: (payload: {
    accessToken: string;
    refreshToken?: string;
    user?: { name?: string; email?: string | null; avatar?: string | null; role?: string | null };
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('auth_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const logoutStore = useAppStore((s) => s.logout);
  const [loading, setLoading] = useState(true);
  const [interceptorsReady, setInterceptorsReady] = useState(false);

  const setUserFromProfile = useCallback(
    (profile: UserProfile) => {
      setUser({
        name: profile.name || profile.email || 'User',
        email: profile.email || null,
        avatar: profile.avatar ?? null,
        role: profile.role ?? null,
      });
    },
    [setUser]
  );

  const bootstrap = useCallback(async () => {
    const accessToken = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken && !refreshToken) {
      setLoading(false);
      return;
    }

    try {
      const profile = await fetchProfile();
      setUserFromProfile(profile);
    } catch (profileError) {
      if (refreshToken) {
        try {
          const tokens = await refreshTokens(refreshToken);
          persistTokens(tokens.accessToken, tokens.refreshToken);
          const profile = await fetchProfile();
          setUserFromProfile(profile);
        } catch (refreshError) {
          console.error('Refresh failed', refreshError);
          clearTokens();
          logoutStore();
        }
      } else {
        clearTokens();
        logoutStore();
      }
    } finally {
      setLoading(false);
    }
  }, [setUserFromProfile, logoutStore]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (interceptorsReady) return;

    setupAuthRequestInterceptor();
    setupAuthInterceptors(undefined, {
      getRefreshToken: () => localStorage.getItem('refresh_token'),
      onTokens: (tokens) => {
        persistTokens(tokens.accessToken, tokens.refreshToken);
      },
      onLogout: () => {
        clearTokens();
        logoutStore();
      },
    });

    setInterceptorsReady(true);
  }, [interceptorsReady, logoutStore]);

  const refreshSession = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;
    try {
      const tokens = await refreshTokens(refreshToken);
      persistTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await fetchProfile();
      setUserFromProfile(profile);
    } catch (err) {
      console.error('Manual refresh failed', err);
      clearTokens();
      logoutStore();
    }
  }, [setUserFromProfile, logoutStore]);

  const handleAuthSuccess = useCallback(
    (payload: { accessToken: string; refreshToken?: string; user?: { name?: string; email?: string | null; avatar?: string | null; role?: string | null } }) => {
      persistTokens(payload.accessToken, payload.refreshToken);
      if (payload.user) {
        setUser({
          name: payload.user.name || payload.user.email || 'User',
          email: payload.user.email || null,
          avatar: payload.user.avatar ?? null,
          role: payload.user.role ?? null,
        });
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    clearTokens();
    logoutStore();
  }, [logoutStore]);

  const value = useMemo(
    () => ({ user, loading, refreshSession, handleAuthSuccess, logout }),
    [user, loading, refreshSession, handleAuthSuccess, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
