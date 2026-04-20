'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register, registerPending, registerError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await register(form); } catch {}
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
          <p className="text-zinc-400 mt-1">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">Get Started</h2>

          {registerError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {(registerError as any)?.response?.data?.message ?? 'Registration failed'}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Your name"
            />
          </div>

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
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={registerPending}
            className="w-full bg-amber-400 text-black font-bold py-2.5 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {registerPending ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300">
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}