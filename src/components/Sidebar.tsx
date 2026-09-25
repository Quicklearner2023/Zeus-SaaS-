import React, { useEffect, useState } from 'react';
import { Activity, Bot, Database, FolderGit2, Globe2, Layers3, Search, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DB } from '@/services/gemini';
import { saasDb } from '@/services/db';

interface SidebarProps { activeTab: string; setActiveTab: (tab: string) => void; }

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [projectsCount, setProjectsCount] = useState(() => saasDb.getProjects().length);
  const agentsCount = MOCK_DB.agents?.length || 0;

  useEffect(() => saasDb.subscribe(() => setProjectsCount(saasDb.getProjects().length)), []);

  const groups = [
    { title: 'Build', items: [
      { id: 'chat', label: 'Orchestrator', icon: Bot },
      { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projectsCount || null },
      { id: 'agents', label: 'Agents & Tasks', icon: Layers3, badge: agentsCount || null },
    ]},
    { title: 'Infrastructure', items: [
      { id: 'database', label: 'Database', icon: Database },
      { id: 'netlify', label: 'Deployments', icon: Globe2 },
      { id: 'governance', label: 'Governance', icon: ShieldCheck },
    ]},
    { title: 'Insights', items: [
      { id: 'dashboards', label: 'Analytics', icon: Activity },
      { id: 'reports', label: 'Reports', icon: Search },
    ]},
  ];

  return (
    <aside className="hidden md:flex w-[248px] shrink-0 h-full flex-col bg-white border-r border-zinc-200/80 px-3 py-4">
      <button onClick={() => setActiveTab('chat')} className="px-3 py-2.5 flex items-center gap-3 text-left group">
        <span className="w-9 h-9 rounded-[13px] bg-zinc-950 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-[1.03] transition-transform">Z</span>
        <span className="min-w-0">
          <span className="block font-black tracking-tight text-[17px]">Zeus</span>
          <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.16em]">SaaS Control Plane</span>
        </span>
      </button>

      <div className="mx-2 mt-3 mb-5 px-3 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-2.5">
        <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50"/><span className="relative w-2 h-2 rounded-full bg-emerald-500"/></span>
        <div className="min-w-0"><div className="text-[11px] font-bold text-zinc-800">Orchestrator online</div><div className="text-[9px] text-zinc-400 font-medium">Netlify · GitHub · Supabase</div></div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-1">
        {groups.map(group => (
          <div key={group.title} className="mb-5">
            <div className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">{group.title}</div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all",
                      active ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950")}>
                    <item.icon size={16} strokeWidth={active ? 2.4 : 2} className={active ? "text-white" : "text-zinc-400"} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && <span className={cn("min-w-5 h-5 px-1.5 rounded-md text-[9px] flex items-center justify-center font-black", active ? "bg-white/10 text-zinc-200" : "bg-zinc-100 text-zinc-500")}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-3 border-t border-zinc-100">
        <div className="mx-1 p-3 rounded-2xl bg-zinc-950 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold text-zinc-300">AUTOMATION</span><Zap size={13}/></div>
          <div className="text-[11px] font-semibold">Autonomous execution ready</div>
          <div className="text-[9px] text-zinc-400 mt-1">Plan → build → deploy</div>
        </div>
      </div>
    </aside>
  );
};
