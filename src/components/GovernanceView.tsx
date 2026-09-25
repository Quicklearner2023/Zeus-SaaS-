import React, { useEffect, useState } from 'react';
import { Activity, FileText, Lock, ShieldCheck, Users } from 'lucide-react';
import { saasDb } from '@/services/db';
import { PlatformRole, UserProfile, AuditLog } from '@/types';

export const GovernanceView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => saasDb.getUsers());
  const [logs, setLogs] = useState<AuditLog[]>(() => saasDb.getAuditLogs());
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/integrations/status').then(r => r.json()).then(setStatus).catch(() => setStatus({}));
    return saasDb.subscribe(() => {
      setUsers(saasDb.getUsers());
      setLogs(saasDb.getAuditLogs());
    });
  }, []);

  const connected = (key:string) => {
    const v = status?.[key];
    if (typeof v === 'object') return Boolean(v?.connected ?? v?.configured);
    return Boolean(v);
  };

  return <div className="h-full overflow-y-auto p-5 md:p-8"><div className="max-w-6xl mx-auto space-y-6">
    <header><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><ShieldCheck size={15}/> Access & audit</div><h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight">Governance</h1><p className="mt-1 text-sm text-zinc-500">Access, integrations, and high-impact actions.</p></header>
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[[ 'Users', String(users.length), Users ], [ 'Audit events', String(logs.length), FileText ], [ 'AI', connected('gemini')?'Connected':'Unavailable', Activity ], [ 'Secrets', 'Server-side', Lock ]].map(([label,value,Icon]:any)=><div key={label} className="bg-white border border-zinc-200 rounded-2xl p-4"><Icon size={16} className="text-zinc-500"/><div className="mt-4 text-lg font-black">{value}</div><div className="text-xs text-zinc-500">{label}</div></div>)}
    </section>
    <section className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="font-bold">Integrations</h2><p className="text-xs text-zinc-500 mt-1">Current server configuration.</p></div><span className="text-xs text-zinc-400">{status?'Live':'Checking'}</span></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{[['Gemini','gemini'],['GitHub','github'],['Netlify','netlify'],['Supabase','supabase']].map(([name,key])=><div key={key} className="border border-zinc-200 rounded-xl p-4"><div className="flex justify-between"><span className="text-sm font-semibold">{name}</span><span className={'w-2 h-2 mt-1 rounded-full '+(connected(key)?'bg-emerald-500':'bg-zinc-300')}/></div><div className="mt-2 text-xs text-zinc-500">{connected(key)?'Connected':'Not connected'}</div></div>)}</div></section>
    <section className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="mb-4"><h2 className="font-bold">Role access</h2><p className="text-xs text-zinc-500 mt-1">Platform users and roles.</p></div>{users.length?<div className="divide-y divide-zinc-100">{users.map(u=><div key={u.id} className="py-3 flex items-center justify-between gap-4"><div><div className="text-sm font-semibold">{u.fullName}</div><div className="text-xs text-zinc-500">{u.email}</div></div><select value={u.role} onChange={e=>saasDb.updateUserRole(u.id,e.target.value as PlatformRole)} className="border border-zinc-200 rounded-lg px-2 py-1 text-xs bg-white"><option value="owner">Owner</option><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></select></div>)}</div>:<div className="py-10 text-center text-sm text-zinc-400">No platform users yet.</div>}</section>
    <section className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="mb-4"><h2 className="font-bold">Audit trail</h2><p className="text-xs text-zinc-500 mt-1">Recent recorded actions.</p></div>{logs.length?<div className="space-y-2">{[...logs].reverse().slice(0,20).map(log=><div key={log.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100"><div className="flex justify-between gap-3"><span className="text-sm font-semibold">{log.action}</span><span className="text-[11px] text-zinc-400">{new Date(log.timestamp).toLocaleString()}</span></div><div className="text-xs text-zinc-500 mt-1">{log.targetName}{log.details?' · '+log.details:''}</div></div>)}</div>:<div className="py-10 text-center text-sm text-zinc-400">No audit events recorded.</div>}</section>
  </div></div>;
};