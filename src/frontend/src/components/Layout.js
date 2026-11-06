import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
export default function Layout() {
    const { email, logout } = useAuth();
    const nav = useNavigate();
    return (_jsxs("div", { className: "min-h-screen flex", children: [_jsxs("aside", { className: "w-64 bg-white border-r border-slate-200 p-4 flex flex-col", children: [_jsx("h1", { className: "text-xl font-bold text-brand-600 mb-6", children: "Analytics AI" }), _jsxs("nav", { className: "space-y-1 flex-1", children: [_jsxs(NavLink, { to: "/", className: ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`, children: [_jsx(LayoutDashboard, { size: 18 }), " Dashboard"] }), _jsxs(NavLink, { to: "/projects", className: ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`, children: [_jsx(FolderKanban, { size: 18 }), " Projects"] })] }), _jsx("div", { className: "text-sm text-slate-500 mb-2", children: email }), _jsxs("button", { onClick: () => { logout(); nav('/login'); }, className: "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600", children: [_jsx(LogOut, { size: 18 }), " Logout"] })] }), _jsx("main", { className: "flex-1 p-6 overflow-auto", children: _jsx(Outlet, {}) })] }));
}
