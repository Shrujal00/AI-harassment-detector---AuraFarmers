import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { harassmentAPI } from '@/services/harassment-api';
import { apiClient } from '@/services/api-client';
import type { User, AuthTokens, UserRole, LoginRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Check for existing authentication on mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  // Listen for auth events
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [toast]);

  const checkExistingAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Check if we have tokens
      const tokens = getStoredTokens();
      if (!tokens) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(tokens)) {
        try {
          await refreshAuth();
        } catch {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
        return;
      }

      // Get current user
      const user = await harassmentAPI.getCurrentUser();
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user, tokens } 
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await harassmentAPI.login(credentials);
      
      // Store tokens
      apiClient.setAuthTokens(response.tokens);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: response.user, tokens: response.tokens } 
      });

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.user.name}`,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await harassmentAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  const refreshAuth = async () => {
    try {
      const tokens = await harassmentAPI.refreshToken();
      const user = await harassmentAPI.getCurrentUser();
      
      apiClient.setAuthTokens({
        accessToken: tokens.accessToken,
        refreshToken: getStoredTokens()?.refreshToken || '',
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
      });
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user, 
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: getStoredTokens()?.refreshToken || '',
            expiresAt: Date.now() + (60 * 60 * 1000),
          }
        } 
      });
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.roles.includes(role) || false;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return state.user?.roles.some(userRole => roles.includes(userRole)) || false;
  }, [state.user]);

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAuth,
    hasRole,
    hasAnyRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper functions
function getStoredTokens(): AuthTokens | null {
  try {
    const stored = localStorage.getItem('harassmentDetector_tokens');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function isTokenExpired(tokens: AuthTokens): boolean {
  const now = Date.now();
  const expiresAt = tokens.expiresAt;
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  
  return now >= (expiresAt - bufferTime);
}

// Higher-order component for role-based access
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasAnyRole, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>; // Replace with proper loading component
    }

    if (!isAuthenticated) {
      return <div>Access denied. Please log in.</div>; // Replace with proper redirect
    }

    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return <div>Access denied. Insufficient permissions.</div>; // Replace with proper error page
    }

    return <Component {...props} />;
  };
}

export type { AuthContextType, AuthState };
