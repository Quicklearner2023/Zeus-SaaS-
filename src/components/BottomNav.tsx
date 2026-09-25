import React from 'react';
import { Activity, Bot, Database, FolderGit2, Globe2, Layers3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps { activeTab: string; setActiveTab: (tab: string) => void; }

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'chat', label: 'Console', icon: Bot },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'agents', label: 'Agents', icon: Layers3 },
    { id: 'database', label: 'Data', icon: Database },
    { id: 'netlify', label: 'Deploy', icon: Globe2 },
    { id: 'dashboards', label: 'Stats', icon: Activity },
  ];
  return <div className="md:hidden fixed bottom-0 inset-x-0 z-50 px-2 pb-2 pt-1 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
    <div className="flex items-center justify-around">
      {items.map(item => {
        const active = activeTab === item.id;
        return <button key={item.id} onClick={() => setActiveTab(item.id)}
          className={cn("min-w-12 px-2 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all", active ? "text-zinc-950 bg-zinc-100" : "text-zinc-400")}>
          <item.icon size={17} strokeWidth={active ? 2.5 : 2}/>
          <span className="text-[9px] font-bold">{item.label}</span>
        </button>;
      })}
    </div>
  </div>;
};
