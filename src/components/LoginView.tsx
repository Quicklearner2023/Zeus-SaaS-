/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { signIn } from '@/services/auth';
import { Bot, Mail, ArrowRight, Loader2, Database, ShieldCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError(null);
    try {
      await signIn(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white shadow-xl shadow-black/10">
            <Bot size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">SaaS Orchestrator</h1>
            <p className="text-zinc-500 font-medium">Autonomous AI Software Engineering Platform</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          {!sent ? (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900">Sign in to Console</h2>
                <p className="text-sm text-zinc-500">We'll send a magic link to your email for secure access.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-zinc-700 uppercase tracking-wider px-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-black/[0.08] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-black/10"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send Magic Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900">Check your email</h2>
                <p className="text-sm text-zinc-500">
                  We've sent a login link to <span className="font-bold text-zinc-900">{email}</span>.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-sm font-bold text-zinc-900 hover:underline"
              >
                Back to login
              </button>
            </div>
          )}
        </div>

        {/* Footer Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-100/50 border border-black/[0.04] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.04] flex items-center justify-center text-zinc-600">
              <Database size={16} />
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider leading-tight">
              Supabase<br /><span className="text-zinc-900">Persistence</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-100/50 border border-black/[0.04] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.04] flex items-center justify-center text-zinc-600">
              <ShieldCheck size={16} />
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider leading-tight">
              Row Level<br /><span className="text-zinc-900">Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
