/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Code,
  Key,
  GitBranch,
  Cpu,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetlifyDevOpsViewProps {
  onAction: (msg?: string) => void;
}

export const NetlifyDevOpsView: React.FC<NetlifyDevOpsViewProps> = ({ onAction }) => {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedBuildCmd, setCopiedBuildCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'secrets' | 'netlify' | 'github'>('secrets');

  const netlifyConfigToml = `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
    [headers.values]
      X-Frame-Options = "DENY"
      X-Content-Type-Options = "nosniff"
      Referrer-Policy = "no-referrer-when-downgrade"`;

  const githubWorkflowYml = `name: Netlify Automated Deployment Pipeline

on:
  push:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
      - uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: \${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}`;

  const handleCopyToml = () => {
    navigator.clipboard.writeText(netlifyConfigToml);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(githubWorkflowYml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleCopyBuild = () => {
    navigator.clipboard.writeText("npm run build && netlify deploy --prod");
    setCopiedBuildCmd(true);
    setTimeout(() => setCopiedBuildCmd(false), 2000);
  };

  const secretVars = [
    {
      name: "GEMINI_API_KEY",
      purpose: "Enables Gemini 3.1 Flash server-side intelligence & agentic sub-task planning.",
      requiredFor: "Core AI Model API",
      where: "Netlify Site Settings > Env Variables & GitHub Secrets",
      icon: Cpu
    },
    {
      name: "NETLIFY_AUTH_TOKEN",
      purpose: "Personal Access Token allowing automated site deploys and build hooks from GitHub.",
      requiredFor: "Automated Netlify Deploy",
      where: "Netlify User Settings > Applications > Personal Access Tokens",
      icon: Key
    },
    {
      name: "NETLIFY_SITE_ID",
      purpose: "Unique API ID targeting your specific Netlify site instance.",
      requiredFor: "Netlify Target Site",
      where: "Netlify Site Settings > General > Site Details > API ID",
      icon: Globe
    },
    {
      name: "GITHUB_TOKEN",
      purpose: "GitHub Access Token for continuous integration deployment comments & repo sync.",
      requiredFor: "GitHub Actions CI/CD",
      where: "GitHub Repository Secrets",
      icon: GitBranch
    }
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Globe size={13} className="text-emerald-600" /> Continuous Integration & Secret Keys
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Netlify & GitHub DevOps Hub</h2>
            <p className="text-zinc-500 text-[14px] font-medium mt-0.5">Manage secret environment variables, Netlify plugins, and automated GitHub CI/CD workflows.</p>
          </div>

          <button 
            onClick={() => onAction("Deploy our current build to Netlify. Instruct the DevOps-Agent to generate the necessary build commands and netlify.toml config.")} 
            className="px-5 py-2.5 bg-black text-white rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Audit Netlify Deployment</span>
          </button>
        </div>

        {/* Integration Status Banner */}
        <div className="bg-white p-6 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">Pre-Integrated Deployment Files Ready</h3>
                <p className="text-xs text-zinc-500 font-medium">Both <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-mono">netlify.toml</code> and <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-mono">.github/workflows/netlify-deploy.yml</code> are created in your project!</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('secrets')} 
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  activeTab === 'secrets' ? "bg-black text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                )}
              >
                🔑 Secret Variables
              </button>
              <button 
                onClick={() => setActiveTab('netlify')} 
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  activeTab === 'netlify' ? "bg-black text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                )}
              >
                🌐 netlify.toml
              </button>
              <button 
                onClick={() => setActiveTab('github')} 
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  activeTab === 'github' ? "bg-black text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                )}
              >
                🐙 GitHub Actions
              </button>
            </div>
          </div>
        </div>

        {/* Secrets & Environment Variables Cards */}
        {activeTab === 'secrets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xl text-zinc-900 tracking-tight flex items-center gap-2">
                <Lock size={18} className="text-zinc-700" />
                Required Secret Environment Variables ({secretVars.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secretVars.map((s, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-800">
                        <s.icon size={16} />
                      </div>
                      <code className="font-mono text-sm font-extrabold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg">
                        {s.name}
                      </code>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                      {s.requiredFor}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">{s.purpose}</p>
                  
                  <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                    <span>Where to add:</span>
                    <span className="text-zinc-700 font-semibold">{s.where}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* netlify.toml View */}
        {activeTab === 'netlify' && (
          <div className="bg-white p-6 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                  <Code size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">Root /netlify.toml File</h3>
                  <p className="text-xs text-zinc-500 font-medium">Configures build command <code className="bg-zinc-100 text-zinc-800 px-1 rounded">npm run build</code>, output folder <code className="bg-zinc-100 text-zinc-800 px-1 rounded">dist</code>, and SPA redirects.</p>
                </div>
              </div>

              <button
                onClick={handleCopyToml}
                className="px-4 py-2 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-xs font-bold text-zinc-800 transition-all flex items-center gap-1.5 shrink-0 border border-black/5"
              >
                {copiedConfig ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedConfig ? 'Copied netlify.toml!' : 'Copy netlify.toml'}</span>
              </button>
            </div>

            <div className="bg-zinc-900 text-emerald-400 font-mono text-[12px] p-4 rounded-2xl overflow-x-auto border border-zinc-800 leading-relaxed">
              <pre>{netlifyConfigToml}</pre>
            </div>
          </div>
        )}

        {/* GitHub Workflow View */}
        {activeTab === 'github' && (
          <div className="bg-white p-6 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                  <GitBranch size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">.github/workflows/netlify-deploy.yml</h3>
                  <p className="text-xs text-zinc-500 font-medium">Automates build and deploy directly to Netlify on every git push.</p>
                </div>
              </div>

              <button
                onClick={handleCopyWorkflow}
                className="px-4 py-2 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-xs font-bold text-zinc-800 transition-all flex items-center gap-1.5 shrink-0 border border-black/5"
              >
                {copiedWorkflow ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedWorkflow ? 'Copied Workflow!' : 'Copy Workflow YML'}</span>
              </button>
            </div>

            <div className="bg-zinc-900 text-amber-300 font-mono text-[12px] p-4 rounded-2xl overflow-x-auto border border-zinc-800 leading-relaxed">
              <pre>{githubWorkflowYml}</pre>
            </div>
          </div>
        )}

        {/* Deploy Process Steps */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-xl text-zinc-900 tracking-tight">Zero-Plumbing Deployment Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="font-extrabold text-sm text-zinc-900">Push Code to GitHub</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Commit and push this repo to your GitHub account. <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">netlify.toml</code>, <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">.github/workflows/netlify-deploy.yml</code>, and <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">.env.example</code> are already created.</p>
            </div>
            
            <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="font-extrabold text-sm text-zinc-900">Link Site on Netlify</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Log in to Netlify, click "Add new site" &gt; "Import from Git", and select your GitHub repository.</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">3</span>
              <h4 className="font-extrabold text-sm text-zinc-900">Set Environment Secret</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">In Netlify Site Settings &gt; Environment Variables, add <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">GEMINI_API_KEY</code> so your deployed app has AI capabilities!</p>
            </div>
          </div>
        </div>

        {/* One-Liner Deploy Command Box */}
        <div className="bg-white p-6 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-base text-zinc-900 tracking-tight flex items-center gap-2">
              <Terminal size={16} className="text-zinc-700" />
              Netlify CLI Direct Production Deploy Command
            </h4>
            <p className="text-xs text-zinc-500 font-medium">Or deploy directly from local terminal in seconds via Netlify CLI.</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <code className="bg-zinc-100 text-zinc-800 px-3 py-2 rounded-xl text-xs font-mono border border-black/5 flex-1 md:flex-initial">
              npm run build && netlify deploy --prod
            </code>
            <button
              onClick={handleCopyBuild}
              className="px-3.5 py-2 bg-black text-white hover:bg-zinc-800 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
            >
              {copiedBuildCmd ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedBuildCmd ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
