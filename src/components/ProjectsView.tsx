/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderGit2, 
  Globe, 
  Database, 
  ExternalLink, 
  Plus, 
  GitBranch, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PLATFORM_STATE } from '@/services/gemini';
import { PlatformProject } from '@/types';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<PlatformProject[]>(PLATFORM_STATE.projects);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProj: PlatformProject = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      name: newProjectName,
      description: newProjectDesc || 'Autonomous SaaS application project',
      framework: 'React + Vite',
      repositoryUrl: `https://github.com/user/${newProjectName.toLowerCase().replace(/\s+/g, '-')}`,
      deploymentUrl: `https://${newProjectName.toLowerCase().replace(/\s+/g, '-')}.netlify.app`,
      githubBranch: 'main',
      netlifySiteId: 'site_' + Math.random().toString(36).substring(2, 8),
      databaseRequired: true,
      databaseProvider: 'Supabase',
      databaseStatus: 'Provisioned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    PLATFORM_STATE.projects = updated;

    setNewProjectName('');
    setNewProjectDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 size={22} className="text-black" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Main SaaS Hub</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Projects Studio</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your autonomous AI software projects, database provisioning status, GitHub repositories, and Netlify CI/CD deployments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-black/20 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-zinc-900">{proj.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{proj.description}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full border border-black/[0.05] shrink-0">
                  {proj.framework}
                </span>
              </div>

              {/* Status Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-black/[0.04] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Database Status</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <Database size={13} className="text-emerald-600" />
                    <span>{proj.databaseProvider}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-black/[0.04] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Deployment Target</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <Globe size={13} className="text-sky-600" />
                    <span>Netlify CI/CD</span>
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="space-y-2 pt-1 text-xs">
                {proj.repositoryUrl && (
                  <a 
                    href={proj.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 text-zinc-700 font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <GitBranch size={13} className="text-zinc-500" />
                      <span className="truncate">{proj.repositoryUrl.replace('https://', '')}</span>
                    </span>
                    <ExternalLink size={12} className="text-zinc-400 shrink-0" />
                  </a>
                )}

                {proj.deploymentUrl && (
                  <a 
                    href={proj.deploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-800 font-semibold transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={13} className="text-emerald-600" />
                      <span className="truncate">{proj.deploymentUrl.replace('https://', '')}</span>
                    </span>
                    <ExternalLink size={12} className="text-emerald-500 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock size={12} />
                <span>Updated {new Date(proj.updatedAt).toLocaleDateString()}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
                <CheckCircle2 size={12} />
                <span>Live Netlify Sync</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for creating a new project */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 border border-black/10 shadow-2xl">
            <h3 className="font-bold text-base text-zinc-900">Create New Autonomous SaaS Project</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. AI Fitness Tracker"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
                <textarea 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="App details..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800"
              >
                Initialize Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
