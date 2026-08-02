/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Code, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Copy, 
  Check,
  Table,
  Users,
  Server
} from 'lucide-react';
import { evaluateDatabaseRequirements } from '@/services/dbIntelligence';
import { PLATFORM_STATE } from '@/services/gemini';
import { DatabaseDecision } from '@/types';

export const DatabaseStudioView: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState('Build a multi-vendor e-commerce marketplace with user signups, product listings, Stripe payments, and admin dashboards.');
  const [testName, setTestName] = useState('E-Commerce Marketplace');
  const [currentDecision, setCurrentDecision] = useState<DatabaseDecision>(() => 
    evaluateDatabaseRequirements('E-Commerce Marketplace', testPrompt)
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleEvaluate = () => {
    const decision = evaluateDatabaseRequirements(testName, testPrompt);
    setCurrentDecision(decision);
  };

  const copySql = (sql: string, index: number) => {
    navigator.clipboard.writeText(sql);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={22} className="text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Architect Studio</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Database & Schema Intelligence</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Automated database decision matrix, Supabase SQL migrations, RLS security policies, and RBAC mapping.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-semibold">
          <Server size={14} className="text-emerald-600" />
          <span>Preferred Provider: Supabase (PostgreSQL)</span>
        </div>
      </div>

      {/* Interactive Requirement Tester */}
      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm">
            <Sparkles size={16} className="text-amber-500" />
            <span>Database Necessity Evaluator</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Algorithm: 10-Point Decision Matrix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Project Title</label>
            <input 
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-black/10 bg-zinc-50"
              placeholder="e.g. School Management System"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-600 mb-1">Project Specification / Prompt</label>
            <input 
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-black/10 bg-zinc-50"
              placeholder="Describe requirements..."
            />
          </div>
        </div>

        <button
          onClick={handleEvaluate}
          className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Database size={14} />
          <span>Run Intelligence Evaluation</span>
        </button>
      </div>

      {/* Decision Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Evaluation Result</span>
              {currentDecision.databaseRequired ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 size={13} />
                  <span>DATABASE REQUIRED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold">
                  <XCircle size={13} />
                  <span>STATIC / CLIENT ONLY</span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900">{currentDecision.projectName}</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                {currentDecision.reason}
              </p>
            </div>

            <div className="pt-2 border-t border-black/[0.04]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Recommended Provider</span>
              <div className="p-3 bg-zinc-50 rounded-xl border border-black/[0.05] text-xs font-bold text-zinc-800 flex items-center justify-between">
                <span>{currentDecision.recommendedProvider}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">PostgreSQL</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.04] space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Required Supabase Stack</span>
            <div className="flex flex-wrap gap-1.5">
              {currentDecision.requiredServices.length > 0 ? (
                currentDecision.requiredServices.map((svc, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg">
                    {svc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400 italic">None required</span>
              )}
            </div>
          </div>
        </div>

        {/* Project RBAC Roles & Schema Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* RBAC Role Mapper */}
          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center gap-2 font-bold text-zinc-800 text-xs uppercase tracking-wider">
              <Users size={15} className="text-indigo-600" />
              <span>Project RBAC Roles Derived</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentDecision.projectRbacRoles.map((role, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span className="capitalize">{role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schema Tables */}
          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-zinc-800 text-xs uppercase tracking-wider">
                <Table size={15} className="text-emerald-600" />
                <span>Derived Database Schema</span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400">Row Level Security (RLS) Active</span>
            </div>

            {currentDecision.suggestedSchema.length > 0 ? (
              <div className="space-y-3">
                {currentDecision.suggestedSchema.map((tbl, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 border border-black/[0.05] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 font-mono">public.{tbl.tableName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <ShieldCheck size={11} />
                        RLS Enforced
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{tbl.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tbl.columns.map((col, cIdx) => (
                        <span key={cIdx} className="text-[10px] font-mono bg-white border border-black/[0.08] px-2 py-0.5 rounded text-zinc-700">
                          {col}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-indigo-700 font-medium bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 mt-2">
                      <span className="font-bold">RLS Policy:</span> {tbl.rlsPolicy}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-400 italic border border-dashed rounded-xl">
                No database schema needed for static site.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SQL Migration Code Output */}
      {currentDecision.generatedMigrations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-zinc-800 text-xs uppercase tracking-wider">
              <Code size={15} className="text-indigo-600" />
              <span>Reproducible Supabase Migration SQL</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">{currentDecision.generatedMigrations[0].filename}</span>
          </div>

          <div className="relative rounded-xl bg-zinc-900 p-4 font-mono text-xs text-zinc-200 overflow-x-auto border border-zinc-800 shadow-inner">
            <button
              onClick={() => copySql(currentDecision.generatedMigrations[0].sql, 0)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              {copiedIndex === 0 ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedIndex === 0 ? 'Copied' : 'Copy SQL'}</span>
            </button>
            <pre className="pr-20 leading-relaxed text-[11px] text-emerald-300">
              {currentDecision.generatedMigrations[0].sql}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
