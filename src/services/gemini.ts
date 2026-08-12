/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import realData from '../data.json';
import { evaluateDatabaseRequirements } from './dbIntelligence';
import { sanitizeText, isHighRiskAction } from './secrets';
import { saasDb } from './db';
import { 
  PlatformProject, 
  DatabaseDecision, 
  AgentRun, 
  AgentLog, 
  ApprovalRequest, 
  AuditLog, 
  UsageRecord,
  UserProfile
} from '@/types';

// Client-side AI bridge. Direct SDK usage moved to server-side for security.
export const MODEL_NAME = "gemini-3.6-flash";

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: Array<{ text: string }>;
  timestamp: Date;
  latencyMs?: number;
  groundingMetadata?: any;
  hasReport?: boolean;
  hasDashboard?: boolean;
  dbDecision?: DatabaseDecision;
  approvalRequest?: ApprovalRequest;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResult {
  id: string;
  name: string;
  result: any;
}

// In-Memory Platform SaaS Database State
export const PLATFORM_STATE = {
  users: [
    { id: 'usr_owner', email: 'architect@saas-orchestrator.io', fullName: 'Lead Architect', role: 'owner', createdAt: new Date().toISOString() },
    { id: 'usr_dev1', email: 'dev@saas-orchestrator.io', fullName: 'Frontend Lead', role: 'admin', createdAt: new Date().toISOString() },
  ] as UserProfile[],

  projects: [
    {
      id: 'proj_ecommerce',
      name: 'E-Commerce Storefront & Admin',
      description: 'Next.js storefront with Supabase Auth, PostgreSQL database, and Netlify CI/CD.',
      framework: 'React + Vite',
      repositoryUrl: 'https://github.com/user/ecommerce-storefront',
      deploymentUrl: 'https://ecommerce-storefront.netlify.app',
      githubBranch: 'main',
      netlifySiteId: 'site_ec12345',
      databaseRequired: true,
      databaseProvider: 'Supabase',
      databaseStatus: 'Provisioned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj_portfolio',
      name: 'Developer Portfolio',
      description: 'Fast, responsive static portfolio built with React and Tailwind CSS.',
      framework: 'React + Vite',
      repositoryUrl: 'https://github.com/user/dev-portfolio',
      deploymentUrl: 'https://dev-portfolio.netlify.app',
      githubBranch: 'main',
      netlifySiteId: 'site_pf67890',
      databaseRequired: false,
      databaseProvider: 'None',
      databaseStatus: 'Not Required',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as PlatformProject[],

  dbDecisions: [] as DatabaseDecision[],

  agentRuns: [
    {
      id: 'run_001',
      taskId: 'task_001',
      projectId: 'proj_ecommerce',
      userPrompt: 'Implement Supabase Auth and RLS policies for products table',
      plan: [
        'Analyze user requirements and RBAC role structure',
        'Evaluate database necessity and select Supabase PostgreSQL',
        'Generate migration SQL 001_initial_schema.sql with RLS policies',
        'Verify TypeScript types and commit changes to GitHub',
        'Trigger automated Netlify build deployment'
      ],
      status: 'completed',
      filesChanged: ['src/services/auth.ts', 'supabase/migrations/001_initial_schema.sql'],
      databaseChanges: ['Created profiles table', 'Enabled RLS on products table'],
      deploymentStatus: 'success',
      deploymentUrl: 'https://ecommerce-storefront.netlify.app',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString()
    }
  ] as AgentRun[],

  agentLogs: [
    {
      id: 'log_001',
      runId: 'run_001',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Lead Architect initialized autonomous lifecycle run.',
      category: 'analysis'
    },
    {
      id: 'log_002',
      runId: 'run_001',
      timestamp: new Date().toISOString(),
      level: 'success',
      message: 'Generated Supabase RLS policies and 001_initial_schema.sql migration.',
      category: 'database'
    }
  ] as AgentLog[],

  approvalRequests: [] as ApprovalRequest[],

  auditLogs: [
    {
      id: 'audit_001',
      userId: 'usr_owner',
      userName: 'Lead Architect',
      action: 'PLATFORM_BOOTSTRAP',
      targetType: 'system',
      targetName: 'SaaS Orchestrator Platform',
      timestamp: new Date().toISOString(),
      details: 'Initialized Platform RBAC, Secret Redaction Engine, and Netlify CI/CD Hub.'
    }
  ] as AuditLog[],

  usageRecords: [
    {
      id: 'usage_today',
      date: new Date().toISOString().split('T')[0],
      agentTaskCount: 14,
      tokensUsed: 124500,
      buildDeployCount: 6,
      activeProjects: 2
    }
  ] as UsageRecord[]
};

// Mock Database for legacy tools
export const MOCK_DB = {
  orders: realData.orders as any[],
  dashboards: [] as any[],
  reports: [] as any[],
  agents: [] as any[],
  reviews: realData.reviews as any[],
  customer_responses: [] as any[],
};

export interface AgentStep {
  id: string;
  type: 'text' | 'tool';
  content?: string;
  toolName?: string;
  toolArgs?: any;
  result?: any;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  latencyMs?: number;
}

export async function sendMessageToAgentStream(
  history: ChatMessage[],
  newMessage: string,
  onUpdate: (data: { history: ChatMessage[], steps: AgentStep[], isDone: boolean, currentText: string }) => void
): Promise<void> {
  // Establishing connection to server-side AI orchestrator
  let currentHistory = [...history];
  const userMsg: ChatMessage = { role: "user", parts: [{ text: newMessage }], timestamp: new Date() };
  currentHistory.push(userMsg);
  
  let steps: AgentStep[] = [{ id: 'init', type: 'text', content: "Connecting to Orchestrator...", status: 'streaming' }];
  
  const notify = (isDone: boolean = false, text: string = "") => {
    onUpdate({
      history: currentHistory,
      steps: [...steps],
      isDone,
      currentText: text
    });
  };

  notify(false, "");

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, newMessage })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // In this MVP phase, we use a non-streaming fallback
    // Future iterations will implement real SSE or WebSocket streaming
    steps[0].status = 'completed';
    steps[0].content = "Response received from Lead Architect.";
    
    const modelMsg: ChatMessage = {
      ...data,
      timestamp: new Date(data.timestamp)
    };
    
    currentHistory.push(modelMsg);
    notify(true, modelMsg.parts[0].text);

  } catch (error: any) {
    console.error("Agent Error:", error);
    const errorMsg: ChatMessage = {
      role: "model",
      parts: [{ text: `I encountered a server-side error: ${error?.message || error}. Please verify GEMINI_API_KEY is set in the dashboard.` }],
      timestamp: new Date(),
    };
    currentHistory.push(errorMsg);
    notify(true, "");
  }
}
export async function sendMessageToAgent(
  history: ChatMessage[],
  newMessage: string,
  onToolCall?: (toolCall: ToolCall) => void
): Promise<ChatMessage[]> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, newMessage })
    });

    if (!response.ok) throw new Error('Backend AI Error');
    
    const data = await response.json();
    return [...history, { role: 'user', parts: [{ text: newMessage }], timestamp: new Date() }, { ...data, timestamp: new Date(data.timestamp) }];
  } catch (error) {
    console.error("Agent Error:", error);
    return [...history, { role: 'model', parts: [{ text: "Error connecting to AI Orchestrator." }], timestamp: new Date() }];
  }
}

