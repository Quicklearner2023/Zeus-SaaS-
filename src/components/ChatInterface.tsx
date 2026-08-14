/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Search, 
  Database,
  Loader2,
  Sparkles,
  CheckCircle2,
  Activity,
  Copy,
  Check,
  RotateCcw,
  BarChart3,
  FileText,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { ChatMessage, ToolCall, AgentStep } from '@/services/gemini';
import { AgentStepBlock } from './AgentStepBlock';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isProcessing: boolean;
  currentTool: ToolCall | null;
  agentSteps: AgentStep[];
  streamingText: string;
  setActiveTab: (tab: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  history, 
  onSendMessage, 
  isProcessing,
  currentTool,
  agentSteps,
  streamingText,
  setActiveTab
}) => {
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activePromptCategory, setActivePromptCategory] = useState<'all' | 'reports' | 'dashboards' | 'orders'>('all');
  const [mobileTraceOpen, setMobileTraceOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isProcessing, currentTool, streamingText]);

  useEffect(() => {
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = leftScrollRef.current.scrollHeight;
    }
  }, [agentSteps]);

  const isGeneratingReport = agentSteps.some(s => s.type === 'tool' && s.toolName === 'generate_yearly_report');
  const isGeneratingDashboard = agentSteps.some(s => s.type === 'tool' && s.toolName === 'create_operations_dashboard');
  const isGeneratingWidget = isGeneratingReport || isGeneratingDashboard;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput("");
  };

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const starterPrompts = [
    {
      category: 'reports',
      icon: FileText,
      label: 'Deploy Sub-Agent Roadmap',
      prompt: 'Use the \'Master Prompt\' strategy to deploy a team of sub-agents (Frontend, Backend, DevOps) to scope out my personal SaaS roadmap.',
      tag: 'Orchestrator'
    },
    {
      category: 'dashboards',
      icon: BarChart3,
      label: 'Netlify DevOps Configuration',
      prompt: 'Deploy our current build to Netlify. Instruct the DevOps-Agent to generate the necessary build commands and netlify.toml config.',
      tag: 'Netlify CI/CD'
    },
    {
      category: 'orders',
      icon: Database,
      label: 'Frontend Component Architecture',
      prompt: 'Start a Frontend Architect sub-agent to construct a modular React + Tailwind CSS component layout for my application.',
      tag: 'React / UI'
    },
    {
      category: 'reports',
      icon: Search,
      label: 'SaaS Performance Analytics',
      prompt: 'Create an operations dashboard analyzing SaaS active users, API request latency, and revenue metrics.',
      tag: 'Analytics'
    }
  ];

  const filteredPrompts = activePromptCategory === 'all' 
    ? starterPrompts 
    : starterPrompts.filter(p => p.category === activePromptCategory);

  return (
    <div className="flex flex-col md:flex-row-reverse h-full w-full gap-4 md:gap-6">
      {/* Right Pane: Process & Agent Execution Trace */}
      <div className={cn(
        "flex-1 md:flex-initial w-full md:w-[50%] lg:w-[55%] flex flex-col rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative transition-all",
        mobileTraceOpen ? "block h-auto" : "hidden md:flex min-h-[300px] md:min-h-0"
      )}>
        <header className="h-[60px] md:h-[72px] flex items-center justify-between px-5 md:px-8 bg-white shrink-0 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-2xl flex items-center justify-center border transition-colors",
              isProcessing ? "bg-black text-white border-black" : "bg-zinc-50 border-black/5 text-zinc-600"
            )}>
              {isProcessing ? (
                <Loader2 className="animate-spin text-white" size={15} />
              ) : (
                <Activity size={15} />
              )}
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-[15px] tracking-tight">Execution Trace</h2>
              <p className="text-[11px] text-zinc-400 font-medium">Real-time function calls & reasoning</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-black/5">
              {agentSteps.length} Steps
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 pt-6 space-y-4" ref={leftScrollRef}>
          {agentSteps.length === 0 && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-300">
                <Activity size={24} />
              </div>
              <p className="text-sm font-semibold text-zinc-600">No Active Execution</p>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Send a request to the agent to observe multi-step tool calls, database queries, and reasoning traces in real-time.
              </p>
            </div>
          )}

          {agentSteps.map((step) => (
            <AgentStepBlock key={step.id} step={step} />
          ))}
        </div>
      </div>

      {/* Left Pane: Chat Console */}
      <div className="flex-1 md:flex-initial w-full md:w-[50%] lg:w-[45%] flex flex-col rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative">
        {/* Header */}
        <header className="h-[60px] md:h-[72px] flex items-center px-5 md:px-8 justify-between shrink-0 border-b border-black/[0.04] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-[15px] tracking-tight">Lead Orchestrator Console</h2>
              <p className="text-[11px] text-zinc-400 font-medium">Sub-Agents • Netlify CI/CD • SaaS Specs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile trace toggle */}
            <button
              onClick={() => setMobileTraceOpen(!mobileTraceOpen)}
              className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700"
            >
              <Activity size={12} />
              <span>Trace</span>
            </button>

            {history.length > 0 && (
              <button 
                onClick={() => window.location.reload()}
                title="Reset conversation"
                className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6" ref={scrollRef}>
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 my-auto">
              <div className="w-14 h-14 bg-zinc-50 border border-black/5 rounded-3xl flex items-center justify-center text-black mb-4 shadow-sm">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">How can I assist your SaaS development?</h3>
              <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-6 leading-relaxed">
                Deploy specialized sub-agents, generate Netlify deployment configs, architect full-stack components, or build analytics.
              </p>

              {/* Prompt Category Pills */}
              <div className="flex gap-2 mb-4">
                {(['all', 'reports', 'dashboards', 'orders'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivePromptCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all",
                      activePromptCategory === cat 
                        ? "bg-black text-white" 
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Starter Cards */}
              <div className="grid grid-cols-1 gap-2.5 w-full max-w-md">
                {filteredPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p.prompt)}
                    className="p-3.5 bg-zinc-50/80 hover:bg-zinc-100 border border-black/[0.04] rounded-2xl transition-all text-left flex items-start gap-3 group hover:border-black/10"
                  >
                    <div className="p-2 rounded-xl bg-white border border-black/5 text-zinc-700 group-hover:bg-black group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <p.icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[13px] text-zinc-900 truncate">{p.label}</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-black/5">{p.tag}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{p.prompt}</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-800 transition-colors my-auto shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const rawText = msg.parts?.map((p: any) => p.text || "").join("") || "";

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={cn(
                  "flex gap-3 max-w-full group",
                  isUser ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-auto mb-1 text-xs font-bold shadow-sm",
                  isUser ? "bg-black text-white" : "bg-zinc-100 border border-black/5 text-zinc-800"
                )}>
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>
                
                <div className={cn(
                  "rounded-3xl text-[13.5px] leading-relaxed max-w-[85%] font-medium relative",
                  isUser 
                    ? "p-4 px-5 bg-black text-white rounded-br-md" 
                    : msg.hasReport || msg.hasDashboard 
                      ? "p-0" 
                      : "p-5 bg-white rounded-bl-md text-zinc-800 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                )}>
                  {!isUser && !msg.hasReport && !msg.hasDashboard && (
                    <button
                      onClick={() => handleCopyMessage(rawText, idx)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-100 transition-all"
                      title="Copy text"
                    >
                      {copiedIndex === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  )}

                  {!isUser && (msg.hasReport || msg.hasDashboard) ? (
                    <div className="flex flex-col gap-3 min-w-[220px]">
                      <div className="p-5 bg-white border border-black/5 rounded-3xl rounded-bl-md shadow-sm flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                          <span className="font-bold text-[14px] text-zinc-900">
                            {msg.hasReport && msg.hasDashboard ? 'Report & Dashboard Ready' : msg.hasReport ? 'Report Ready' : 'Dashboard Ready'}
                          </span>
                        </div>
                        <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">
                          {msg.hasReport ? 'Executive insights and metrics generated.' : 'Visual widgets and performance charts generated.'}
                        </p>
                        {msg.latencyMs && (
                          <div className="text-emerald-600 flex items-center gap-1.5 text-[11px] font-mono font-semibold">
                            <Activity size={12} /> Generated in {(msg.latencyMs / 1000).toFixed(2)}s
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {msg.hasReport && (
                          <button 
                            onClick={() => setActiveTab('reports')}
                            className="bg-black text-white px-5 py-2.5 rounded-full font-semibold text-[12px] hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-2"
                          >
                            <span>View Reports</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                        {msg.hasDashboard && (
                          <button 
                            onClick={() => setActiveTab('dashboards')}
                            className="bg-black text-white px-5 py-2.5 rounded-full font-semibold text-[12px] hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-2"
                          >
                            <span>View Dashboards</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={cn("markdown-body", isUser ? "text-white" : "text-zinc-800")}>
                        <ReactMarkdown>{rawText}</ReactMarkdown>
                      </div>

                      {/* Interactive Database Decision Card */}
                      {!isUser && msg.dbDecision && (
                        <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] text-xs space-y-3 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <Database size={14} className="text-emerald-600" />
                              Database Decision Matrix
                            </span>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              msg.dbDecision.databaseRequired 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-zinc-200 text-zinc-700"
                            )}>
                              {msg.dbDecision.databaseRequired ? 'Supabase DB Required' : 'Static / No DB'}
                            </span>
                          </div>
                          
                          <p className="text-zinc-600 text-[11.5px] leading-relaxed">
                            {msg.dbDecision.reason}
                          </p>

                          <button 
                            onClick={() => setActiveTab('database')}
                            className="mt-1 px-3 py-1.5 bg-black text-white rounded-xl text-[11px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                          >
                            <span>Inspect Schema & RLS Policies</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}

                      {/* Approval Request Card */}
                      {!isUser && msg.approvalRequest && (
                        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 flex items-center gap-1.5">
                              <Zap size={14} className="text-amber-600" />
                              {msg.approvalRequest.title}
                            </span>
                            <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              Requires User Approval
                            </span>
                          </div>
                          <p className="text-amber-800 text-[11.5px]">
                            {msg.approvalRequest.reason}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button 
                              onClick={() => {
                                alert("Action approved by Lead Architect!");
                                msg.approvalRequest!.status = 'approved';
                              }}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px] hover:bg-emerald-700 shadow-sm"
                            >
                              Approve High-Risk Action
                            </button>
                            <button 
                              onClick={() => {
                                alert("Action rejected by Lead Architect.");
                                msg.approvalRequest!.status = 'rejected';
                              }}
                              className="px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded-xl font-bold text-[11px] hover:bg-zinc-300"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {!isUser && msg.latencyMs !== undefined && (
                        <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-zinc-400 text-[10.5px]">
                          <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={11} /> {(msg.latencyMs / 1000).toFixed(2)}s
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Web Grounding Sources */}
                  {msg.groundingMetadata?.groundingChunks && (
                    <div className="mt-4 pt-4 border-t border-black/[0.04]">
                      <p className="text-[10px] font-bold text-zinc-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
                        <Search size={11} /> Verified Sources
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                          <a 
                            key={i} 
                            href={chunk.web?.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10.5px] px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-600 border border-black/5 transition-colors font-medium truncate max-w-[200px]"
                          >
                            {chunk.web?.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {isProcessing && streamingText && !isGeneratingWidget && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-full"
            >
              <div className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-auto mb-1 bg-zinc-100 border border-black/5 text-zinc-800 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="p-5 rounded-3xl rounded-bl-md text-[13.5px] leading-relaxed max-w-[85%] font-medium bg-white border border-black/[0.04] shadow-sm text-zinc-800 opacity-80">
                <div className="markdown-body text-zinc-800">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}

          {isProcessing && !streamingText && !isGeneratingWidget && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-zinc-100 border border-black/5 text-zinc-800 shadow-sm flex items-center justify-center mt-auto mb-1">
                <Bot size={14} />
              </div>
              <div className="bg-white px-5 py-4 rounded-3xl rounded-bl-md border border-black/[0.04] flex items-center gap-2 shadow-sm">
                <span className="text-xs font-semibold text-zinc-400 mr-2">Thinking</span>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {isProcessing && isGeneratingWidget && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-full"
            >
              <div className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-auto mb-1 bg-zinc-100 border border-black/5 text-zinc-800 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="flex flex-col gap-3 min-w-[220px]">
                <div className="p-5 bg-white border border-black/5 rounded-3xl rounded-bl-md shadow-sm flex flex-col gap-2">
                  <span className="font-bold text-[14px] text-zinc-900">
                    {isGeneratingReport && isGeneratingDashboard ? 'Generating Report & Dashboard...' : isGeneratingReport ? 'Generating Report...' : 'Generating Dashboard...'}
                  </span>
                  <div className="text-zinc-500 flex items-center gap-2 text-[12px] font-medium">
                    <Loader2 size={13} className="animate-spin text-black" /> Formulating multi-parameter analytics
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 shrink-0 bg-white border-t border-black/[0.03]">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-zinc-50 rounded-full border border-black/5 p-1.5 focus-within:ring-2 focus-within:ring-black/10 focus-within:bg-white transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Orchestrator to deploy sub-agents, write Netlify configs, or build feature specs..."
              disabled={isProcessing}
              className="flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-zinc-400 text-zinc-900 text-[13.5px] font-medium"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-40 transition-transform hover:scale-105 shrink-0"
            >
              {isProcessing ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={15} className="text-white relative right-0.5" strokeWidth={2.5} />}
            </button>
          </form>

          {/* Quick Prompt Pill Row */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">Quick Actions:</span>
            <button 
              onClick={() => onSendMessage("Use the 'Master Prompt' strategy to deploy a team of sub-agents for my web application.")} 
              className="px-3 py-1 bg-zinc-50 hover:bg-black hover:text-white rounded-full text-zinc-700 font-semibold text-[11px] whitespace-nowrap border border-black/5 shrink-0 transition-all"
            >
              ⚡ Deploy Sub-Agent Team
            </button>
            <button 
              onClick={() => onSendMessage("Deploy our current build to Netlify and generate netlify.toml config.")} 
              className="px-3 py-1 bg-zinc-50 hover:bg-black hover:text-white rounded-full text-zinc-700 font-semibold text-[11px] whitespace-nowrap border border-black/5 shrink-0 transition-all"
            >
              🌐 Netlify CI/CD Setup
            </button>
            <button 
              onClick={() => onSendMessage("Create a dashboard analyzing active users, API request latency, and SaaS metrics.")} 
              className="px-3 py-1 bg-zinc-50 hover:bg-black hover:text-white rounded-full text-zinc-700 font-semibold text-[11px] whitespace-nowrap border border-black/5 shrink-0 transition-all"
            >
              📈 SaaS Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
