import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  adminLogin,
  adminLogout,
  onAdminAuthChange,
  sendAdminPasswordReset,
  verifyAdminStatus,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  bootstrapLogin: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAdminAuthChange(async (firebaseUser) => {
      const currentMockSession = sessionStorage.getItem('hhd_admin_session');
      if (firebaseUser) {
        setUser(firebaseUser);
        const adminCheck = await verifyAdminStatus(firebaseUser);
        setIsAdmin(adminCheck);
      } else {
        if (currentMockSession === 'active_authenticated') {
          setIsAdmin(true);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const loggedUser = await adminLogin(email, pass);
      setUser(loggedUser);
      setIsAdmin(true);
      sessionStorage.setItem('hhd_admin_session', 'active_authenticated');
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const bootstrapLogin = () => {
    sessionStorage.setItem('hhd_admin_session', 'active_authenticated');
    setIsAdmin(true);
  };

  const logout = async () => {
    sessionStorage.removeItem('hhd_admin_session');
    await adminLogout();
    setUser(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendAdminPasswordReset(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        bootstrapLogin,
        logout,
        resetPassword,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
