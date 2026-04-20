'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, loginPending, loginError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400">IronForge</h1>
          <p className="text-zinc-400 mt-1">Push Pull Legs Tracker</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">Sign In</h2>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {(loginError as any)?.response?.data?.message ?? 'Invalid credentials'}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginPending}
            className="w-full bg-amber-400 text-black font-bold py-2.5 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {loginPending ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-zinc-500">
            No account?{' '}
            <Link href="/register" className="text-amber-400 hover:text-amber-300">
              Register
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}