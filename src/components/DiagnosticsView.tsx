import React, { useCallback, useState } from 'react';
import { Activity, CheckCircle2, CircleAlert, Loader2, Play, RotateCcw, Server, Database, Github, Globe, Brain, Wrench, Bot } from 'lucide-react';

type Check = {
  layer: string;
  ok: boolean;
  latencyMs: number;
  detail?: string;
  error?: { name?: string; message?: string; code?: string | null };
  provider?: string;
  model?: string;
  response?: string;
  rounds?: number;
  account?: string;
  site?: { id?: string; name?: string; url?: string; state?: string };
  latestDeploy?: { id?: string; state?: string; url?: string };
  tool?: string;
};

const API_BASE = import.meta.env.PROD ? '/.netlify/functions/server' : '';

const layers = [
  { id: 'server', label: 'Server', icon: Server, description: 'Netlify Function runtime responds.' },
  { id: 'supabase', label: 'Supabase', icon: Database, description: 'Live database connectivity and query.' },
  { id: 'github', label: 'GitHub', icon: Github, description: 'Authenticated GitHub API access.' },
  { id: 'netlify', label: 'Netlify', icon: Globe, description: 'Site and latest deploy API access.' },
  { id: 'gemini', label: 'Gemini', icon: Brain, description: 'Minimal live provider request.' },
  { id: 'tool-executor', label: 'Tool executor', icon: Wrench, description: 'Runs one real registered tool read-only.' },
  { id: 'orchestrator', label: 'Orchestrator', icon: Bot, description: 'Full server-side AI request without tools.' },
] as const;

export const DiagnosticsView: React.FC = () => {
  const [checks, setChecks] = useState<Record<string, Check>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string>('');

  const run = useCallback(async (layer: string) => {
    setRunning(layer);
    try {
      const response = await fetch(`${API_BASE}/api/system-check?layer=${encodeURIComponent(layer)}`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      const result = data?.checks?.[0];
      if (result) setChecks(prev => ({ ...prev, [result.layer]: result }));
      else setChecks(prev => ({ ...prev, [layer]: { layer, ok: false, latencyMs: 0, error: { message: data?.error || `HTTP ${response.status}` } } }));
      setLastRun(new Date().toLocaleTimeString());
    } catch (error: any) {
      setChecks(prev => ({ ...prev, [layer]: { layer, ok: false, latencyMs: 0, error: { message: error?.message || 'Request failed' } } }));
    } finally {
      setRunning(null);
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunning('all');
    try {
      const response = await fetch(`${API_BASE}/api/system-check?layer=all`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (Array.isArray(data?.checks)) {
        setChecks(Object.fromEntries(data.checks.map((check: Check) => [check.layer, check])));
      }
      setLastRun(new Date().toLocaleTimeString());
    } catch (error: any) {
      setChecks(prev => ({ ...prev, server: { layer: 'server', ok: false, latencyMs: 0, error: { message: error?.message || 'Diagnostics request failed' } } }));
    } finally {
      setRunning(null);
    }
  }, []);

  const successful = Object.values(checks).filter(c => c.ok).length;
  const failed = Object.values(checks).filter(c => !c.ok).length;

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><Activity size={15}/> System diagnostics</div>
          <div className="mt-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Test the stack layer by layer</h1>
              <p className="mt-1 text-sm text-zinc-500">Run the whole chain or isolate one integration to find exactly where a failure starts.</p>
            </div>
            <button onClick={runAll} disabled={!!running} className="px-4 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50">
              {running === 'all' ? <Loader2 size={14} className="animate-spin"/> : <Play size={14}/>} Run full workflow
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4"><div className="text-xl font-black">{successful}</div><div className="text-xs text-zinc-500">Passed</div></div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4"><div className="text-xl font-black">{failed}</div><div className="text-xs text-zinc-500">Failed</div></div>
          <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl p-4"><div className="text-sm font-bold">{lastRun || '—'}</div><div className="text-xs text-zinc-500">Last test</div></div>
        </section>

        <section className="space-y-3">
          {layers.map(({ id, label, icon: Icon, description }) => {
            const check = checks[id];
            const busy = running === id || running === 'all';
            return (
              <div key={id} className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0"><Icon size={17}/></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold">{label}</h2>
                      {check && (check.ok ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><CheckCircle2 size={13}/> Passed</span> : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700"><CircleAlert size={13}/> Failed</span>)}
                      {check && <span className="text-[11px] text-zinc-400">{check.latencyMs}ms</span>}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{description}</p>
                    {check?.detail && <p className="mt-3 text-xs text-zinc-700">{check.detail}</p>}
                    {check?.error?.message && <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 font-mono break-words">{check.error.message}{check.error.code ? ` [${check.error.code}]` : ''}</div>}
                    {check?.provider && <div className="mt-2 text-[11px] text-zinc-500">Provider: <b>{check.provider}</b> · Model: <b>{check.model}</b> · Rounds: <b>{check.rounds}</b></div>}
                    {check?.account && <div className="mt-2 text-[11px] text-zinc-500">GitHub account: <b>{check.account}</b></div>}
                    {check?.site && <div className="mt-2 text-[11px] text-zinc-500">Site: <b>{check.site.name || check.site.id}</b>{check.site.state ? ` · ${check.site.state}` : ''}</div>}
                    {check?.latestDeploy && <div className="mt-1 text-[11px] text-zinc-500">Latest deploy: <b>{check.latestDeploy.state || 'unknown'}</b></div>}
                    {check?.response && <div className="mt-2 text-[11px] text-zinc-500">Response: <b>{check.response}</b></div>}
                  </div>
                  <button onClick={() => run(id)} disabled={!!running} className="shrink-0 px-3 py-2 rounded-lg border border-zinc-200 text-[11px] font-bold hover:bg-zinc-50 disabled:opacity-50 flex items-center gap-1.5">
                    {busy ? <Loader2 size={13} className="animate-spin"/> : <RotateCcw size={13}/>} Test
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};
