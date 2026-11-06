import React, { createContext, useContext, useState } from 'react';

interface AuthState { token: string | null; refreshToken: string | null; userId: string | null; email: string | null; }
interface AuthCtx extends AuthState { login: (t: string, r: string, u: string, e: string) => void; logout: () => void; }

const Ctx = createContext<AuthCtx>({ token: null, refreshToken: null, userId: null, email: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refresh'),
    userId: localStorage.getItem('userId'),
    email: localStorage.getItem('email'),
  }));
  const login = (t: string, r: string, u: string, e: string) => {
    localStorage.setItem('token', t); localStorage.setItem('refresh', r); localStorage.setItem('userId', u); localStorage.setItem('email', e);
    setState({ token: t, refreshToken: r, userId: u, email: e });
  };
  const logout = () => {
    localStorage.clear(); setState({ token: null, refreshToken: null, userId: null, email: null });
  };
  return <Ctx.Provider value={{ ...state, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);