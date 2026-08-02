/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { 
  Bot, 
  Activity, 
  Search, 
  Layers,
  Globe,
  Zap,
  FolderGit2,
  Database,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DB, PLATFORM_STATE } from '@/services/gemini';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const agentsCount = MOCK_DB.agents?.length || 0;
  const projectsCount = PLATFORM_STATE.projects?.length || 0;

  const menuItems = [
    { id: 'chat', label: 'Orchestrator Console', icon: Bot, badge: null },
    { id: 'projects', label: 'Projects Studio', icon: FolderGit2, badge: projectsCount > 0 ? projectsCount : null },
    { id: 'database', label: 'Database & Schema', icon: Database, badge: 'Supabase' },
    { id: 'agents', label: 'Sub-Agents & Tasks', icon: Layers, badge: agentsCount > 0 ? agentsCount : null },
    { id: 'netlify', label: 'Netlify & DevOps', icon: Globe, badge: 'Netlify' },
    { id: 'governance', label: 'Governance & Audit', icon: ShieldCheck, badge: 'RBAC' },
    { id: 'dashboards', label: 'SaaS Analytics', icon: Activity, badge: null },
    { id: 'reports', label: 'AI Specs & Reports', icon: Search, badge: null },
  ];

  return (
    <div className="hidden md:flex w-[280px] flex-col h-screen pt-8 pb-6 pl-8 pr-4 bg-[#F3F3F3] select-none shrink-0 border-r border-black/[0.03]">
      {/* Brand & Title */}
      <div className="mb-8 px-4 flex flex-col gap-2">
        <button 
          onClick={() => window.location.reload()} 
          className="group text-left focus:outline-none"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-extrabold text-xs shadow-sm group-hover:scale-105 transition-transform">
              SO
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">SaaS Orchestrator</span>
          </div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-tight group-hover:text-zinc-600 transition-colors">
            Dev Agent Studio
          </h1>
        </button>

        {/* Engine Status Tag */}
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.06] text-[11px] text-zinc-600 font-medium shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="truncate">Lead Architect Online</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 pr-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-medium transition-all group",
                isActive 
                  ? "bg-black text-white shadow-sm" 
                  : "text-zinc-600 hover:bg-black/[0.04] hover:text-black"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-white" : "text-zinc-400 group-hover:text-black")} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                  isActive 
                    ? "bg-zinc-800 text-zinc-200" 
                    : "bg-black/5 text-zinc-500 group-hover:bg-black/10 group-hover:text-black"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="mt-auto px-4 pt-4 border-t border-black/[0.04] flex flex-col gap-2">
        <div className="p-3 bg-white/80 rounded-2xl border border-black/[0.05] text-[11px] text-zinc-500 flex items-center justify-between shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-zinc-400" />
            <span className="font-medium text-zinc-700">Target: Netlify CI/CD</span>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md">Ready</span>
        </div>
      </div>
    </div>
  );
};
