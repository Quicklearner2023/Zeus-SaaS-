/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Bot, 
  Loader2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Copy, 
  Check,
  Zap,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentStep } from '@/services/gemini';

export const AgentStepBlock: React.FC<{ step: AgentStep }> = ({ step }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyArgs = () => {
    if (step.toolArgs) {
      navigator.clipboard.writeText(JSON.stringify(step.toolArgs, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-4 rounded-3xl transition-all border",
        step.status === 'streaming' 
          ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border-black/10 ring-2 ring-black/5" 
          : "bg-zinc-50/80 border-black/[0.03] hover:border-black/10 hover:bg-white"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border text-zinc-600",
            step.type === 'tool' ? "bg-black text-white border-black" : "bg-white border-black/5"
          )}>
            {step.type === 'tool' ? <Terminal size={12} /> : <Bot size={12} />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[13px] text-zinc-900 truncate">
              {step.type === 'tool' ? `Tool: ${step.toolName}` : 'Agent Reasoning'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono capitalize">
              {step.type === 'tool' ? 'Function execution' : 'Thought stream'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {step.status === 'streaming' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-zinc-700 text-[10px] font-medium">
              <Loader2 size={11} className="animate-spin text-zinc-600" />
              Running...
            </span>
          )}

          {step.status === 'completed' && (
            <div className="flex items-center gap-2">
              {step.latencyMs !== undefined && (
                <span className="text-[10px] text-zinc-500 font-mono bg-white px-2 py-0.5 rounded-full border border-black/5">
                  {(step.latencyMs / 1000).toFixed(2)}s
                </span>
              )}
              <div className="text-emerald-500">
                <CheckCircle2 size={15} />
              </div>
            </div>
          )}

          {step.type === 'tool' && step.toolArgs && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-black/5 transition-colors"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Tool Call Payload & Arguments */}
      <AnimatePresence>
        {step.type === 'tool' && step.toolArgs && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-black/[0.04]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Code2 size={11} /> Parameters
              </span>
              <button
                onClick={handleCopyArgs}
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <pre className="text-[11px] bg-white text-zinc-700 p-3 rounded-2xl overflow-x-auto font-mono whitespace-pre-wrap border border-black/[0.05] shadow-inner">
              {JSON.stringify(step.toolArgs, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Agent Text Content */}
      {step.type === 'text' && step.content && (
        <div className="text-[13px] text-zinc-600 mt-2 line-clamp-3 leading-relaxed bg-white p-3 rounded-2xl border border-black/[0.03]">
          "{step.content}"
        </div>
      )}

      {/* Result Output */}
      {step.result && (
        <div className="mt-3 pt-3 border-t border-black/[0.04] flex flex-col gap-1 text-[11px]">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
            <Zap size={10} className="text-emerald-500" /> Output Result
          </span> 
          <div className="bg-emerald-50/50 border border-emerald-200/50 text-emerald-950 p-2.5 rounded-2xl font-medium truncate">
            {step.result.message || 'Execution finished successfully'}
          </div>
        </div>
      )}
    </motion.div>
  );
};
