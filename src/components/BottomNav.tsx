/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Bot, Layers, Globe, FolderGit2, Database, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'chat', label: 'Console', icon: Bot },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'agents', label: 'Agents', icon: Layers },
    { id: 'netlify', label: 'Netlify', icon: Globe },
    { id: 'governance', label: 'Governance', icon: ShieldCheck },
  ];

  return (
    <div className="md:hidden flex items-center justify-around bg-white border-t border-black/5 px-2 py-2 shrink-0 pb-safe z-50 shadow-lg">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all",
              isActive 
                ? "text-black bg-zinc-100 font-semibold" 
                : "text-zinc-400 hover:text-zinc-600 font-medium"
            )}
          >
            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
