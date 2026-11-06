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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { email, password, fullName });
      login(data.accessToken, data.refreshToken, data.userId, data.email);
      nav('/');
    } catch (e: any) {
      setErr(e.response?.data?.title || 'Register failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="w-full border rounded-lg px-3 py-2" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600">Register</button>
        <a href="/login" className="block text-center text-sm text-brand-600">Sign in</a>
      </form>
    </div>
  );
}