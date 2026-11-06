import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';

export default function Layout() {
  const { email, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <h1 className="text-xl font-bold text-brand-600 mb-6">Analytics AI</h1>
        <nav className="space-y-1 flex-1">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}>
            <LayoutDashboard size={18}/> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}>
            <FolderKanban size={18}/> Projects
          </NavLink>
        </nav>
        <div className="text-sm text-slate-500 mb-2">{email}</div>
        <button onClick={() => { logout(); nav('/login'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <LogOut size={18}/> Logout
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}