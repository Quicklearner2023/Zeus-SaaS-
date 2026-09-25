/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  PlatformProject, 
  DatabaseDecision, 
  AgentTask, 
  AgentRun, 
  AgentLog, 
  ApprovalRequest, 
  AuditLog, 
  UsageRecord, 
  UserProfile 
} from '@/types';

const API_BASE = import.meta.env.PROD ? '/.netlify/functions/server' : '';

class SaaSDatabaseManager {
  private projects: PlatformProject[] = [];
  private users: UserProfile[] = [];
  private auditLogs: AuditLog[] = [];
  private listeners: Set<() => void> = new Set();
  private isLoading: boolean = false;

  constructor() {
    this.refresh();
  }

  public async refresh() {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const [projectsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/projects`),
        fetch(`${API_BASE}/api/audit-logs`)
      ]);

      if (projectsRes.ok) {
        this.projects = await projectsRes.json();
      }
      if (logsRes.ok) {
        this.auditLogs = await logsRes.json();
      }
      
      this.notifyListeners();
    } catch (err) {
      console.warn('Failed to refresh data from server:', err);
    } finally {
      this.isLoading = false;
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  // --- Projects API ---
  public getProjects(): PlatformProject[] {
    return this.projects;
  }

  public async addProject(project: Omit<PlatformProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlatformProject> {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    
    if (!res.ok) throw new Error('Failed to create project');
    
    const newProj = await res.json();
    this.projects = [newProj, ...this.projects];
    
    // Add audit log
    this.addAuditLog('CREATE_PROJECT', 'project', newProj.name, `Created project ${newProj.name} with ${newProj.databaseProvider} database.`);

    this.notifyListeners();
    return newProj;
  }

  // --- Users API (Mock for now, will connect to Supabase Auth) ---
  public getUsers(): UserProfile[] {
    return this.users.length > 0 ? this.users : [
      { id: 'usr_owner', email: 'architect@saas-orchestrator.io', fullName: 'Lead Architect', role: 'owner', createdAt: new Date().toISOString() }
    ];
  }

  public async addUser(user: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    this.users = [...this.users, newUser];
    this.addAuditLog('ADD_PLATFORM_USER', 'system', newUser.fullName, `Granted ${newUser.role} access to ${newUser.email}.`);
    this.notifyListeners();
    return newUser;
  }

  public async updateUserRole(userId: string, role: UserProfile['role']) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.users[idx].role = role;
      this.addAuditLog('UPDATE_USER_ROLE', 'system', this.users[idx].fullName, `Updated platform role to ${role}.`);
      this.notifyListeners();
    }
  }

  public async syncWithSupabaseRemote(): Promise<{ success: boolean; message: string }> {
    await this.refresh();
    return { success: true, message: "Synchronized with SaaS Platform Database." };
  }

  // --- Audit Logs API ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public async addAuditLog(action: string, targetType: AuditLog['targetType'], targetName: string, details: string) {
    const logData = {
      userId: 'usr_owner',
      userName: 'Lead Architect',
      action,
      targetType,
      targetName,
      details,
      timestamp: new Date().toISOString()
    };

    const res = await fetch(`${API_BASE}/api/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });

    if (res.ok) {
      const newLog = await res.json();
      this.auditLogs = [newLog, ...this.auditLogs];
      this.notifyListeners();
    }
  }

  // --- Stubs for compatibility ---
  public getDbDecisions(): DatabaseDecision[] { return []; }
  public addDbDecision(_: DatabaseDecision) {}
  public getApprovalRequests(): ApprovalRequest[] { return []; }
  public addApprovalRequest(_: ApprovalRequest) {}
  public updateApprovalStatus(_a: string, _b: 'approved' | 'rejected') {}
  public resetDatabase() {}
}

export const saasDb = new SaaSDatabaseManager();
