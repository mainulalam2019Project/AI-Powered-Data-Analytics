import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const Ctx = createContext({ token: null, refreshToken: null, userId: null, email: null, login: () => { }, logout: () => { } });
export function AuthProvider({ children }) {
    const [state, setState] = useState(() => ({
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refresh'),
        userId: localStorage.getItem('userId'),
        email: localStorage.getItem('email'),
    }));
    const login = (t, r, u, e) => {
        localStorage.setItem('token', t);
        localStorage.setItem('refresh', r);
        localStorage.setItem('userId', u);
        localStorage.setItem('email', e);
        setState({ token: t, refreshToken: r, userId: u, email: e });
    };
    const logout = () => {
        localStorage.clear();
        setState({ token: null, refreshToken: null, userId: null, email: null });
    };
    return _jsx(Ctx.Provider, { value: { ...state, login, logout }, children: children });
}
export const useAuth = () => useContext(Ctx);
