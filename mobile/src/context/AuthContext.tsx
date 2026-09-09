import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('@deskmaster:token');
        const savedUser = await AsyncStorage.getItem('@deskmaster:user');
        if (savedToken && savedUser) {
          setUser(JSON.parse(savedUser));
          // Refresh in background
          try {
            const fresh = await authService.getMe();
            setUser(fresh);
            await AsyncStorage.setItem('@deskmaster:user', JSON.stringify(fresh));
          } catch (e) {}
        }
      } catch (e) {
        console.error('Falha ao restaurar sessão mobile:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStorage();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    setUser(data.user);
    await AsyncStorage.setItem('@deskmaster:token', data.access_token);
    await AsyncStorage.setItem('@deskmaster:user', JSON.stringify(data.user));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@deskmaster:token');
    await AsyncStorage.removeItem('@deskmaster:user');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSuperAdmin, isCompanyAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
