import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isCompanyUser: boolean;
  canManageUsers: boolean;
  canManageCompanies: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Falha ao autenticar sessão existente:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const updated = await authService.getMe();
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.error('Erro ao atualizar dados do usuário:', e);
      }
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const isCompanyUser = user?.role === 'COMPANY_USER';
  const canManageUsers = isSuperAdmin || isCompanyAdmin;
  const canManageCompanies = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isSuperAdmin,
        isCompanyAdmin,
        isCompanyUser,
        canManageUsers,
        canManageCompanies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
