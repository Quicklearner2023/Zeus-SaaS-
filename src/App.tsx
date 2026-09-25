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
    if (msg) handleSendMessage(msg);
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[#f6f7f9] text-zinc-950 selection:bg-zinc-900 selection:text-white">
      <div className="flex h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-200/70 bg-white/90 backdrop-blur-xl shrink-0">
            <button onClick={() => setActiveTab('chat')} className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center text-[11px] font-black tracking-tight">Z</span>
              <span className="font-extrabold tracking-tight">Zeus</span>
            </button>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden p-2.5 md:p-5">
            <div className="h-full min-h-0 rounded-[26px] md:rounded-[30px] border border-zinc-200/80 bg-[#f8f9fb] shadow-[0_12px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              {activeTab === 'chat' && (
                <ChatInterface history={history} onSendMessage={handleSendMessage} isProcessing={isProcessing}
                  currentTool={currentTool} agentSteps={agentSteps} streamingText={streamingText} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'projects' && <ProjectsView />}
              {activeTab === 'database' && <DatabaseStudioView />}
              {activeTab === 'agents' && <SubAgentsView onAction={handleAction} />}
              {activeTab === 'netlify' && <NetlifyDevOpsView onAction={handleAction} />}
              {activeTab === 'governance' && <GovernanceView />}
              {activeTab === 'reports' && <ReportsView onAction={handleAction} />}
              {activeTab === 'dashboards' && <DashboardsView onAction={handleAction} />}
            </div>
          </div>
        </main>
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
