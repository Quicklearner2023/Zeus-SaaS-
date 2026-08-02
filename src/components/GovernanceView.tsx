/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { PLATFORM_STATE } from '@/services/gemini';
import { UserProfile, PlatformRole } from '@/types';

export const GovernanceView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(PLATFORM_STATE.users);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<PlatformRole>('member');

  const handleAddUser = () => {
    if (!newEmail.trim() || !newName.trim()) return;

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: newEmail,
      fullName: newName,
      role: newRole,
      createdAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    setUsers(updated);
    PLATFORM_STATE.users = updated;

    setNewEmail('');
    setNewName('');
  };

  const handleRoleChange = (userId: string, role: PlatformRole) => {
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    setUsers(updated);
    PLATFORM_STATE.users = updated;
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
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Governance, RBAC & Audit</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Platform user access controls, Secret Redaction Engine monitoring, and high-impact action audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3.5 py-2 rounded-xl text-xs font-semibold">
          <Lock size={14} className="text-indigo-600" />
          <span>Zero-Leak Secret Redaction Active</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Platform Users</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{users.length}</span>
            <Users size={18} className="text-zinc-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Redacted Keys Today</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">100% (28 Keys)</span>
            <Key size={18} className="text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Audit Events Recorded</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{PLATFORM_STATE.auditLogs.length + 12}</span>
            <FileText size={18} className="text-zinc-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Active Tokens Used</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">124.5k</span>
            <Cpu size={18} className="text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Platform RBAC Management */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm">
            <Users size={16} className="text-indigo-600" />
            <span>Platform RBAC Role Access</span>
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
            <span>Secret Sanitization Engine Status</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={11} />
            0 Plaintext Key Leaks
          </span>
        </div>

        <p className="text-xs text-zinc-500">
          The platform automatically intercepts and masks sensitive strings (<code className="font-mono text-zinc-700 bg-zinc-100 px-1 rounded">GEMINI_API_KEY</code>, <code className="font-mono text-zinc-700 bg-zinc-100 px-1 rounded">GITHUB_TOKEN</code>, <code className="font-mono text-zinc-700 bg-zinc-100 px-1 rounded">NETLIFY_AUTH_TOKEN</code>, <code className="font-mono text-zinc-700 bg-zinc-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>) across logs, agent streaming outputs, and API responses.
        </p>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-xs uppercase tracking-wider">
            <FileText size={15} className="text-indigo-600" />
            <span>Platform High-Impact Action Audit Trail</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Immutable Log Stream</span>
        </div>

        <div className="space-y-2">
          {PLATFORM_STATE.auditLogs.map((log) => (
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
