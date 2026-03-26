import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, updateMe } from '../services/api';
import type { AuthUser } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await apiLogin(email, password);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const { data } = await apiRegister(firstName, lastName, email, password);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user'),
    ]);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; email?: string; password?: string }) => {
    const { data: updated } = await updateMe(data);
    const newUser: AuthUser = {
      ...user!,
      name: `${updated.firstName} ${updated.lastName}`,
      email: updated.email,
    };
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
