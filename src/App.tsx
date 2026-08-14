/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { ChatInterface } from '@/components/ChatInterface';
import { SubAgentsView } from '@/components/SubAgentsView';
import { NetlifyDevOpsView } from '@/components/NetlifyDevOpsView';
import { ProjectsView } from '@/components/ProjectsView';
import { DatabaseStudioView } from '@/components/DatabaseStudioView';
import { GovernanceView } from '@/components/GovernanceView';
import { ReportsView } from '@/components/ReportsView';
import { DashboardsView } from '@/components/DashboardsView';
import { sendMessageToAgentStream, ChatMessage, ToolCall, AgentStep } from '@/services/gemini';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolCall | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [streamingText, setStreamingText] = useState("");

  const handleSendMessage = async (msg: string) => {
    setIsProcessing(true);
    setStreamingText("");
    setAgentSteps([]);
    try {
      await sendMessageToAgentStream(history, msg, (data) => {
        if (data.isDone) {
          setHistory(data.history);
          setIsProcessing(false);
          setStreamingText("");
        } else {
          setHistory(data.history);
          setAgentSteps(data.steps);
          setStreamingText(data.currentText);
        }
      });
    } catch (e) {
      console.error("Error sending message to agent:", e);
      setIsProcessing(false);
    }
  };

  const handleAction = (msg?: string) => {
    setActiveTab('chat');
    if (msg) {
      handleSendMessage(msg);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans text-zinc-900 bg-[#F3F3F3] overflow-hidden selection:bg-black selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 pt-4 pb-2 shrink-0 bg-[#F3F3F3]">
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-left focus:outline-none">
          <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
            SO
          </div>
          <span className="text-lg font-extrabold text-black tracking-tight">SaaS Orchestrator</span>
        </button>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative px-3 pb-3 pt-2 md:pt-6 md:pb-6 md:pr-6 md:pl-2">
        <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden relative">
          {activeTab === 'chat' && (
            <ChatInterface 
              history={history} 
              onSendMessage={handleSendMessage} 
              isProcessing={isProcessing}
              currentTool={currentTool}
              agentSteps={agentSteps}
              streamingText={streamingText}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'projects' && <ProjectsView />}
          {activeTab === 'database' && <DatabaseStudioView />}
          {activeTab === 'agents' && <SubAgentsView onAction={handleAction} />}
          {activeTab === 'netlify' && <NetlifyDevOpsView onAction={handleAction} />}
          {activeTab === 'governance' && <GovernanceView />}
          {activeTab === 'reports' && <ReportsView onAction={handleAction} />}
          {activeTab === 'dashboards' && <DashboardsView onAction={handleAction} />}
        </div>
        
        <div className="mt-3 px-4 text-[11px] text-zinc-400 text-center md:text-right shrink-0 font-medium">
          Personal SaaS Suite • Autonomous AI Software Builder • Netlify & Supabase CI/CD Ready
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
