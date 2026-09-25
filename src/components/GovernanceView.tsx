/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Eye, 
  Key, 
  Activity, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  Zap,
  UserPlus,
  Database
} from 'lucide-react';
import { saasDb } from '@/services/db';
import { UserProfile, PlatformRole, AuditLog } from '@/types';

export const GovernanceView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => saasDb.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => saasDb.getAuditLogs());
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<PlatformRole>('member');

  useEffect(() => {
    const fetchConfigStatus = async () => {
      try {
        const res = await fetch('/api/config-status');
        const data = await res.json();
        setConfigStatus(data);
      } catch (err) {
        console.error('Failed to fetch config status:', err);
      }
    };
    fetchConfigStatus();

    const unsubscribe = saasDb.subscribe(() => {
      setUsers(saasDb.getUsers());
      setAuditLogs(saasDb.getAuditLogs());
    });
    return unsubscribe;
  }, []);

  const handleAddUser = () => {
    if (!newEmail.trim() || !newName.trim()) return;

    saasDb.addUser({
      email: newEmail,
      fullName: newName,
      role: newRole
    });

    setNewEmail('');
    setNewName('');
  };

  const handleRoleChange = (userId: string, role: PlatformRole) => {
    saasDb.updateUserRole(userId, role);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={22} className="text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Platform Security</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Governance</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Access, integrations, and high-impact actions.
          </p>
        </div>

        </div>

        

      {/* Integration Status Dashboard */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm">
            <Zap size={16} className="text-amber-500" />
            <span>Active Platform Integrations</span>
          </div>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Live Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'gemini', label: 'Gemini AI Orchestrator', status: configStatus?.gemini, desc: 'Lead Architect & Sub-Agent Brain' },
            { id: 'github', label: 'GitHub Repository Control', status: configStatus?.github, desc: 'Source Code & Commit Management' },
            { id: 'netlify', label: 'Netlify Deployment API', status: configStatus?.netlify, desc: 'Build & Site Configuration' },
            { id: 'supabase', label: 'Supabase Data Persistence', status: configStatus?.supabase, desc: 'PostgreSQL & Real-time Storage' },
          ].map((int) => (
            <div key={int.id} className="p-4 rounded-xl border border-black/[0.04] bg-zinc-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">{int.label}</span>
                <span className={`h-2 w-2 rounded-full ${int.status ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">{int.desc}</p>
              <div className="flex items-center gap-1.5 pt-1">
                {int.status ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <Activity size={12} />
                    Config Required
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!configStatus && (
          <div className="flex items-center justify-center py-4">
            <p className="text-xs text-zinc-400 animate-pulse font-medium">Synchronising with Netlify Runtime...</p>
          </div>
        )}
      </div>

      {/* Platform RBAC Management */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm">
            <Users size={16} className="text-indigo-600" />
            <span>Role access</span>
          </div>
          <span className="text-xs text-zinc-400">Roles: Owner, Admin, Member, Viewer</span>
        </div>

        {/* Add User Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-xl border border-black/[0.05]">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Full Name</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Email Address</label>
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. sarah@saas.io"
              className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Platform Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as PlatformRole)}
              className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="owner">Owner (Full Governance)</option>
              <option value="admin">Admin (Manage Projects)</option>
              <option value="member">Member (Developer)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddUser}
              className="w-full py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] text-zinc-400 font-medium">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="py-3 font-bold text-zinc-900">{u.fullName}</td>
                  <td className="py-3 text-zinc-600 font-mono">{u.email}</td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as PlatformRole)}
                      className="px-2.5 py-1 bg-white border border-black/[0.08] rounded-lg text-xs font-bold text-zinc-800 focus:outline-none"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3 text-zinc-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secret Redaction Engine Monitor */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-xs uppercase tracking-wider">
            <Lock size={15} className="text-emerald-600" />
            <span>Secrets</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={11} />
            Server-side only
          </span>
        </div>

        <p className="text-xs text-zinc-500">
          Secrets remain on the server and are not rendered into the client UI.
        </p>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-xs uppercase tracking-wider">
            <FileText size={15} className="text-indigo-600" />
            <span>Audit trail</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Recent recorded actions</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 bg-zinc-50 border border-black/[0.04] rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900">
                  <span>{log.action}</span>
                  <span className="text-[10px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-mono">{log.targetName}</span>
                </div>
                <p className="text-zinc-500 text-[11px]">{log.details}</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-4">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
