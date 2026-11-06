import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [err, setErr] = useState('');
    const { login } = useAuth();
    const nav = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', { email, password, fullName });
            login(data.accessToken, data.refreshToken, data.userId, data.email);
            nav('/');
        }
        catch (e) {
            setErr(e.response?.data?.title || 'Register failed');
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-100", children: _jsxs("form", { onSubmit: submit, className: "bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4", children: [_jsx("h2", { className: "text-2xl font-bold text-center", children: "Create Account" }), err && _jsx("div", { className: "text-red-600 text-sm", children: err }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2", placeholder: "Full name", value: fullName, onChange: e => setFullName(e.target.value) }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2", placeholder: "Email", value: email, onChange: e => setEmail(e.target.value) }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2", type: "password", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value) }), _jsx("button", { className: "w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600", children: "Register" }), _jsx("a", { href: "/login", className: "block text-center text-sm text-brand-600", children: "Sign in" })] }) }));
}
