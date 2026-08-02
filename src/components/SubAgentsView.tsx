/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Sparkles, 
  Cpu, 
  Code2, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Terminal, 
  Globe, 
  Wrench,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DB } from '@/services/gemini';

interface SubAgentsViewProps {
  onAction: (msg?: string) => void;
}

export const SubAgentsView: React.FC<SubAgentsViewProps> = ({ onAction }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMasterPrompt, setCopiedMasterPrompt] = useState(false);
  const [customProjectName, setCustomProjectName] = useState('Personal SaaS App');

  const agents = MOCK_DB.agents || [];

  const masterPromptText = `You are an expert Lead Developer agent. Your task is to act as the primary architect for ${customProjectName}. Your goal is to break down this request into modular technical tasks. You will manage a team of sub-agents: 1. Frontend-Agent (React/Tailwind), 2. Backend-Agent (Node/Supabase), and 3. DevOps-Agent (Netlify/CI-CD). For each task, you must provide a clean, production-ready code block. Ensure all code is scalable, follows DRY principles, and includes documentation. Before outputting code, verify that it adheres to the latest version of the framework specified. If you encounter a dependency conflict, resolve it by suggesting the most stable alternative.`;

  const handleCopyMasterPrompt = () => {
    navigator.clipboard.writeText(masterPromptText);
    setCopiedMasterPrompt(true);
    setTimeout(() => setCopiedMasterPrompt(false), 2000);
  };

  const presetAgents = [
    {
      name: "Frontend Architect",
      role: "React, Tailwind & Component Architecture",
      icon: Code2,
      badge: "UI/UX",
      prompt: "Deploy a Frontend Architect sub-agent to design a modular React single-page component structure with Tailwind CSS for my SaaS."
    },
    {
      name: "Backend API Specialist",
      role: "Node.js, Serverless Routes & DB Queries",
      icon: Cpu,
      badge: "API & DB",
      prompt: "Deploy a Backend API Specialist sub-agent to construct serverless endpoint routes and database integration handlers."
    },
    {
      name: "DevOps / Netlify Expert",
      role: "netlify.toml, Edge Functions & CI/CD",
      icon: Globe,
      badge: "DevOps",
      prompt: "Deploy a DevOps Netlify Expert sub-agent to write the netlify.toml configuration file, build scripts, and edge function definitions."
    },
    {
      name: "Analytics Specialist",
      role: "Data Telemetry & Performance Tracking",
      icon: Wrench,
      badge: "Analytics",
      prompt: "Deploy an Analytics Specialist sub-agent to setup telemetry metrics and user analytics reporting."
    }
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Layers size={13} className="text-zinc-500" /> Agentic Architecture Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Sub-Agent Management Studio</h2>
            <p className="text-zinc-500 text-[14px] font-medium mt-0.5">Deploy, orchestrate, and review specialized AI workers for your web applications.</p>
          </div>

          <button 
            onClick={() => onAction("Use the 'Master Prompt' strategy to deploy a team of sub-agents to scope out our tech stack and project roadmap.")} 
            className="px-5 py-2.5 bg-black text-white rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Sparkles size={14} />
            <span>Deploy Team Roadmap</span>
          </button>
        </div>

        {/* Master Prompt Copy Box */}
        <div className="bg-white p-6 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                MP
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">Master Sub-Agent Generator Prompt</h3>
                <p className="text-xs text-zinc-500 font-medium">Use this prompt in System Instructions or send to Orchestrator to instantiate sub-agent teams.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={customProjectName}
                onChange={(e) => setCustomProjectName(e.target.value)}
                placeholder="Project Name..."
                className="px-3 py-1.5 rounded-full border border-black/10 text-xs font-semibold focus:outline-none focus:border-black"
              />
              <button
                onClick={handleCopyMasterPrompt}
                className="px-4 py-2 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-xs font-bold text-zinc-800 transition-all flex items-center gap-1.5 shrink-0 border border-black/5"
              >
                {copiedMasterPrompt ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedMasterPrompt ? 'Copied Prompt!' : 'Copy Master Prompt'}</span>
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 text-zinc-300 font-mono text-[12px] p-4 rounded-2xl overflow-x-auto border border-zinc-800 leading-relaxed relative group">
            <p className="whitespace-pre-wrap">{masterPromptText}</p>
          </div>
        </div>

        {/* Available Specialized Agents Grid */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-xl text-zinc-900 tracking-tight">Deploy Specialized Sub-Agents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presetAgents.map((ag, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-black/15 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-800 group-hover:bg-black group-hover:text-white transition-colors">
                      <ag.icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 uppercase tracking-wider">
                      {ag.badge}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-zinc-900 tracking-tight">{ag.name}</h4>
                  <p className="text-xs text-zinc-500 font-medium mt-1 leading-snug">{ag.role}</p>
                </div>

                <button
                  onClick={() => onAction(ag.prompt)}
                  className="mt-5 w-full py-2 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-bold text-zinc-800 transition-all flex items-center justify-center gap-1.5 border border-black/5"
                >
                  <span>Deploy Worker</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Executed Agents History Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xl text-zinc-900 tracking-tight flex items-center gap-2">
              <Terminal size={18} className="text-zinc-700" />
              Sub-Agent Execution Logs ({agents.length})
            </h3>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-black/[0.04] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-400 mx-auto">
                <Bot size={24} />
              </div>
              <h4 className="text-base font-bold text-zinc-800">No Sub-Agents Executed Yet</h4>
              <p className="text-zinc-500 font-medium text-xs max-w-sm mx-auto">
                Ask the Lead Orchestrator in Console to trigger a sub-agent for Frontend, Backend API, or Netlify DevOps tasks.
              </p>
              <button
                onClick={() => onAction("Start a Frontend Architect sub-agent to construct a clean UI hierarchy for our application.")}
                className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-semibold hover:bg-zinc-800 transition-all inline-flex items-center gap-2"
              >
                <span>Trigger First Sub-Agent</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[...agents].reverse().map((agent, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center font-bold text-xs">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-zinc-900 tracking-tight">{agent.name}</h4>
                        <p className="text-xs text-zinc-500 font-medium">{agent.task}</p>
                      </div>
                    </div>

                    {agent.latencyMs && (
                      <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-full border border-black/5">
                        {(agent.latencyMs / 1000).toFixed(2)}s execution
                      </span>
                    )}
                  </div>

                  <div className="bg-zinc-900 text-zinc-200 font-mono text-xs p-4 rounded-2xl border border-zinc-800 overflow-x-auto max-h-60 overflow-y-auto leading-relaxed">
                    <pre className="whitespace-pre-wrap">{agent.result}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
