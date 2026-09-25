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
export const MODEL_NAME = "gemini-3.8-flash";

// In production call the function directly. Netlify's /api/* proxy can time out
// long-running agent requests before the function itself reaches its 60s limit.
const API_BASE = import.meta.env.PROD ? '/.netlify/functions/server' : '';

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
  users: [] as UserProfile[],
  projects: [] as PlatformProject[],
  dbDecisions: [] as DatabaseDecision[],
  agentRuns: [] as AgentRun[],
  agentLogs: [] as AgentLog[],
  approvalRequests: [] as ApprovalRequest[],
  auditLogs: [] as AuditLog[],
  usageRecords: [] as UsageRecord[]
};

// Mock Database for legacy tools
export const MOCK_DB = {
  orders: [] as any[],
  dashboards: [] as any[],
  reports: [] as any[],
  agents: [] as any[],
  reviews: [] as any[],
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
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, newMessage })
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      let errorData: any = {};
      try { errorData = raw ? JSON.parse(raw) : {}; } catch { errorData = { error: raw }; }
      const detail = errorData.error || errorData.message || `HTTP ${response.status}`;
      const suffix = [
        errorData.errorId ? ` [${errorData.errorId}]` : "",
        errorData.code ? ` (${errorData.code})` : "",
        errorData.type ? ` <${errorData.type}>` : "",
        errorData.build ? ` {${errorData.build}}` : ""
      ].join("");
      throw new Error(`${detail}${suffix || `Server error: ${response.status} ${response.statusText || "Unknown Error"}`}`);
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
      parts: [{ text: `I encountered a server-side error: ${error?.message || error}` }],
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
    const response = await fetch(`${API_BASE}/api/chat`, {
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

