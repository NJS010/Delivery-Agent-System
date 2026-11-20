import { useState } from 'react';
import api from '../api/client';

export default function AdminLogin({ onSuccess, notify }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('adminToken', data.token);
      onSuccess(data.token);
      notify('Signed in to Operations Console', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Invalid credentials', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Admin Sign In</h2>
      <p className="text-sm text-slate-500 mb-5">Authenticate to access dispatch controls and courier analytics.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}