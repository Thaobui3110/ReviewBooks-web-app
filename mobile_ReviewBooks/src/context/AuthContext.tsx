import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authApi from '../api/authApi';
import { setAuthToken } from '../api/client';
import { saveToken, loadToken, clearToken } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate phiên đăng nhập từ AsyncStorage lúc mở app (thay session cookie của web).
  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        setAuthToken(token);
        try {
          const data = await authApi.me();
          setUser(data.user);
        } catch {
          await clearToken();
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(username: string, password: string) {
    const data = await authApi.login(username, password);
    setAuthToken(data.token);
    await saveToken(data.token);
    setUser(data.user);
  }

  async function register(username: string, email: string, password: string, confirmPassword: string) {
    await authApi.register({ username, email, password, confirmPassword });
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi mạng lúc đăng xuất — vẫn xoá phiên cục bộ để người dùng thoát được.
    }
    await clearToken();
    setAuthToken(null);
    setUser(null);
  }

  async function updateUsername(username: string) {
    // Token cũ mang username cũ — server ký lại token mới, phải lưu đè lên token cũ.
    const data = await authApi.updateProfile(username);
    setAuthToken(data.token);
    await saveToken(data.token);
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
}
