import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Github, Globe, Database, Brain, ExternalLink, Rocket } from 'lucide-react';

interface NetlifyDevOpsViewProps { onAction: (msg?: string) => void; }

type IntegrationStatus = any;

const API_BASE = import.meta.env.PROD ? '/.netlify/functions/server' : '';

export const NetlifyDevOpsView: React.FC<NetlifyDevOpsViewProps> = ({ onAction }) => {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_BASE}/api/integrations/status`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Unable to load integration status');
      setStatus(data);
    } catch (e: any) { setError(e?.message || 'Unable to load integration status'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const Badge = ({ connected, label }: { connected?: boolean; label: string }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
      {connected ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {label}
    </span>
  );

  const Card = ({ icon, title, children }: any) => (
    <div className="bg-white rounded-3xl border border-black/[0.06] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center">{icon}</div><h3 className="font-extrabold text-sm text-zinc-900">{title}</h3></div>{children?.badge}</div>
      {children?.body}
    </div>
  );

  const net = status?.netlify || {};
  const gh = status?.github || {};
  const sb = status?.supabase || {};

  return <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#FAFAFA]">
    <div className="max-w-6xl mx-auto space-y-7">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1"><Rocket size={13}/> Infrastructure</div><h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Deployment & Integrations</h2><p className="text-zinc-500 text-sm mt-1">Live infrastructure state from GitHub, Netlify, Supabase and Gemini.</p></div>
        <div className="flex gap-2"><button onClick={refresh} disabled={loading} className="px-4 py-2.5 bg-white border border-black/[0.08] rounded-xl text-xs font-bold flex items-center gap-2"> <RefreshCw size={14} className={loading?'animate-spin':''}/> Refresh</button><button onClick={()=>onAction('Deploy the current project and report the real deployment status.')} className="px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold">Deploy</button></div>
      </div>
      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={<Globe size={17}/>} title="Netlify" children={{badge:<Badge connected={!!net.connected} label={net.connected?'Connected':'Unavailable'}/>, body:<div className="space-y-3 text-xs"><div className="flex justify-between"><span className="text-zinc-500">Site</span><b>{net.name || '—'}</b></div><div className="flex justify-between"><span className="text-zinc-500">Production</span><span className="font-mono truncate max-w-[60%]">{net.url || '—'}</span></div><div className="flex justify-between"><span className="text-zinc-500">Latest deploy</span><Badge connected={net.latestDeploy?.state==='ready'} label={net.latestDeploy?.state || '—'}/></div>{net.latestDeploy?.url && <a href={net.latestDeploy.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold">Open deployment <ExternalLink size={12}/></a>}</div>}} />
        <Card icon={<Github size={17}/>} title="GitHub" children={{badge:<Badge connected={!!gh.connected} label={gh.connected?'Connected':'Unavailable'}/>, body:<div className="space-y-3 text-xs"><div className="flex justify-between"><span className="text-zinc-500">Account</span><b>{gh.login || '—'}</b></div><div className="flex justify-between"><span className="text-zinc-500">Token</span><span>{gh.configured?'Configured':'Missing'}</span></div></div>}} />
        <Card icon={<Database size={17}/>} title="Supabase" children={{badge:<Badge connected={!!sb.connected} label={sb.connected?'Connected':'Unavailable'}/>, body:<div className="space-y-3 text-xs"><div className="flex justify-between"><span className="text-zinc-500">Projects</span><b>{sb.projectCount ?? '—'}</b></div><div className="flex justify-between"><span className="text-zinc-500">Audit records</span><b>{sb.auditCount ?? '—'}</b></div></div>}} />
        <Card icon={<Brain size={17}/>} title="Gemini" children={{badge:<Badge connected={!!status?.gemini} label={status?.gemini?'Configured':'Missing'}/>, body:<div className="text-xs text-zinc-500">Server-side API access is {status?.gemini?'configured':'not configured'}. The key is never displayed here.</div>}} />
      </div>
    </div>
  </div>;
};
