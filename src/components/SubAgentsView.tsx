import React, { useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, Code2, Cpu, Globe, Layers, Wrench } from 'lucide-react';
import { MOCK_DB } from '@/services/gemini';

export const SubAgentsView: React.FC<{onAction:(msg?:string)=>void}> = ({onAction}) => {
  const agents = MOCK_DB.agents || [];
  const [project, setProject] = useState('');
  const presets = [
    {name:'Frontend',role:'React UI and component architecture',icon:Code2,prompt:'Design and implement the frontend architecture for this project.'},
    {name:'Backend',role:'API routes and data integration',icon:Cpu,prompt:'Design and implement the backend API and data integration for this project.'},
    {name:'DevOps',role:'GitHub, Netlify and CI/CD',icon:Globe,prompt:'Review and implement the GitHub and Netlify deployment pipeline for this project.'},
    {name:'Analytics',role:'Telemetry and product reporting',icon:Wrench,prompt:'Design the analytics and reporting layer for this project.'}
  ];
  const run = (prompt:string) => onAction(project.trim() ? prompt + ' Project: ' + project.trim() : prompt);
  return <div className="h-full overflow-y-auto p-5 md:p-8"><div className="max-w-6xl mx-auto space-y-6">
    <header><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><Layers size={15}/> Agent workspace</div><h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight">Agents & tasks</h1><p className="mt-1 text-sm text-zinc-500">Launch focused workers from the orchestrator.</p></header>
    <section className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="flex flex-col sm:flex-row gap-3"><input value={project} onChange={e=>setProject(e.target.value)} placeholder="Project name (optional)" className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none"/><button onClick={()=>run('Start a team for the current project. First plan the work, then execute the required tasks.')} className="px-4 py-2 rounded-xl bg-zinc-950 text-white text-sm font-semibold">Start from console</button></div></section>
    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{presets.map(({name,role,icon:Icon,prompt})=><div key={name} className="bg-white border border-zinc-200 rounded-2xl p-4"><div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center"><Icon size={17}/></div><h3 className="mt-4 font-bold">{name}</h3><p className="mt-1 text-xs text-zinc-500">{role}</p><button onClick={()=>run(prompt)} className="mt-4 w-full border border-zinc-200 rounded-xl py-2 text-xs font-semibold hover:bg-zinc-50">Run task <ArrowRight size={12} className="inline ml-1"/></button></div>)}</section>
    <section className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="font-bold">Recent runs</h2><p className="text-xs text-zinc-500 mt-1">Recorded agent activity.</p></div><span className="text-xs text-zinc-400">{agents.length}</span></div>{agents.length ? <div className="space-y-3">{[...agents].reverse().map((agent:any,i)=><div key={i} className="border border-zinc-200 rounded-xl p-4"><div className="flex gap-3"><CheckCircle2 className="text-emerald-600 shrink-0" size={17}/><div><div className="font-semibold text-sm">{agent.name}</div><div className="text-xs text-zinc-500 mt-0.5">{agent.task}</div></div></div><pre className="mt-3 bg-zinc-950 text-zinc-200 rounded-xl p-3 text-[11px] overflow-auto max-h-48 whitespace-pre-wrap">{agent.result}</pre></div>)}</div> : <div className="py-12 text-center"><Bot size={24} className="mx-auto text-zinc-300"/><p className="mt-3 text-sm font-medium">No agent runs yet.</p><p className="text-xs text-zinc-400 mt-1">Start a task from this page or the console.</p></div>}</section>
  </div></div>;
};