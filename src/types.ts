/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlatformRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: PlatformRole;
  createdAt: string;
}

export interface PlatformProject {
  id: string;
  name: string;
  description: string;
  framework: 'React + Vite' | 'Next.js' | 'Express + React' | 'Static HTML';
  repositoryUrl?: string;
  deploymentUrl?: string;
  githubBranch?: string;
  netlifySiteId?: string;
  databaseRequired: boolean;
  databaseProvider?: 'Supabase' | 'None' | 'Shared' | 'Dedicated';
  databaseStatus?: 'Provisioned' | 'Not Required' | 'Pending Approval' | 'Configured';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedAt: string;
}

export interface DatabaseDecision {
  projectId: string;
  projectName: string;
  databaseRequired: boolean;
  reason: string;
  recommendedProvider: 'Supabase' | 'None' | 'Shared' | 'Dedicated';
  requiredServices: ('PostgreSQL' | 'Supabase Authentication' | 'Row Level Security' | 'Supabase Storage')[];
  suggestedSchema: {
    tableName: string;
    description: string;
    columns: string[];
    rlsPolicy: string;
  }[];
  generatedMigrations: {
    filename: string;
    sql: string;
  }[];
  projectRbacRoles: string[];
}

export interface AgentTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  userRequest: string;
  status: 'planning' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface AgentRun {
  id: string;
  taskId: string;
  projectId: string;
  userPrompt: string;
  plan: string[];
  status: 'running' | 'waiting_approval' | 'completed' | 'failed';
  filesChanged: string[];
  databaseChanges: string[];
  deploymentStatus: 'pending' | 'deploying' | 'success' | 'failed';
  deploymentUrl?: string;
  startedAt: string;
  completedAt?: string;
}

export interface AgentLog {
  id: string;
  runId: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  category: 'analysis' | 'code' | 'database' | 'github' | 'netlify' | 'security';
}

export interface ApprovalRequest {
  id: string;
  runId: string;
  projectId: string;
  actionType: 
    | 'delete_database' 
    | 'drop_table' 
    | 'delete_repository' 
    | 'expose_secrets' 
    | 'create_paid_resource' 
    | 'force_push_branch' 
    | 'disable_security';
  title: string;
  reason: string;
  estimatedImpact: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'project' | 'database' | 'github' | 'netlify' | 'approval' | 'system';
  targetName: string;
  timestamp: string;
  details: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  agentTaskCount: number;
  tokensUsed: number;
  buildDeployCount: number;
  activeProjects: number;
}

export interface ProjectIntegration {
  id: string;
  projectId: string;
  type: 'github' | 'netlify' | 'supabase';
  status: 'connected' | 'disconnected' | 'error';
  targetIdentifier: string;
  lastSyncedAt: string;
}
