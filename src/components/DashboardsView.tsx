/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  Layers, 
  ArrowRight,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DB } from '@/services/gemini';

interface DashboardsViewProps {
  onAction: (msg?: string) => void;
}

export const DashboardsView: React.FC<DashboardsViewProps> = ({ onAction }) => {
  const dashboards = MOCK_DB.dashboards || [];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Activity size={13} className="text-zinc-500" /> Interactive Visual Analytics
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Operations Dashboard</h2>
            <p className="text-zinc-500 text-[14px] font-medium mt-0.5">Visual charts, regional performance, and real-time KPI metrics.</p>
          </div>

          <button 
            onClick={() => onAction("Create a dashboard analyzing key sales markets, shipping performance, and top product categories.")} 
            className="px-5 py-2.5 bg-black text-white rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Sparkles size={14} />
            <span>Build Custom Dashboard</span>
          </button>
        </div>

        {/* Preset Prompt Triggers Bar */}
        <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-zinc-700" />
            <span className="text-xs font-bold text-zinc-800">Quick Dashboard Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onAction("Create a dashboard about our key markets with KPIs and sales charts.")}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-semibold text-zinc-700 transition-all border border-black/5"
            >
              📈 Key Markets Dashboard
            </button>
            <button 
              onClick={() => onAction("Create a dashboard for logistics, delivery delays, and fulfillment metrics.")}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-semibold text-zinc-700 transition-all border border-black/5"
            >
              🚚 Logistics & Delivery Stats
            </button>
            <button 
              onClick={() => onAction("Create a dashboard analyzing review ratings and customer feedback scores.")}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-semibold text-zinc-700 transition-all border border-black/5"
            >
              ⭐ Review Sentiment Stats
            </button>
          </div>
        </div>

        {/* Dashboards Grid */}
        <div className="grid gap-10">
          {dashboards.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.04] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-400 mx-auto">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold text-zinc-800">No Dashboards Generated Yet</h3>
              <p className="text-zinc-500 font-medium text-xs max-w-sm mx-auto">
                Ask the Virtual Assistant to create an interactive dashboard for key markets, logistics, or sales metrics.
              </p>
              <button
                onClick={() => onAction("Create a dashboard about our key markets.")}
                className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-semibold hover:bg-zinc-800 transition-all inline-flex items-center gap-2"
              >
                <span>Generate Key Markets Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            [...dashboards].reverse().map((dashboard, i) => {
              const mainChartMax = Math.max(...(dashboard.main_chart?.data || []).map((m: any) => m.value || 0));
              const secondaryChartMax = Math.max(...(dashboard.secondary_chart?.data || []).map((m: any) => m.value || 0));

              return (
                <div key={i} className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-extrabold text-2xl text-zinc-900 tracking-tight flex items-center gap-2">
                      <BarChart3 size={22} className="text-zinc-700" />
                      {dashboard.title}
                    </h3>
                  </div>
                  
                  {/* KPIs Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {dashboard.kpis?.filter((kpi: any) => kpi.value !== 'N/A' && kpi.value !== 'n/a').map((kpi: any, idx: number) => (
                      <div key={idx} className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-black/10 transition-all">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">{kpi.label}</span>
                        <div className="flex items-end justify-between gap-1">
                          <span className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight leading-none">{kpi.value}</span>
                          {kpi.trend && kpi.trend !== 'N/A' && kpi.trend !== 'n/a' && (
                            <span className={cn(
                              "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
                              kpi.trend.startsWith('+') ? "text-emerald-700 bg-emerald-50" : kpi.trend.startsWith('-') ? "text-red-700 bg-red-50" : "text-zinc-500 bg-zinc-100"
                            )}>
                              {kpi.trend}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main and Secondary Charts Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="font-extrabold text-lg text-zinc-900 tracking-tight">{dashboard.main_chart?.title}</h4>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mt-0.5">{dashboard.main_chart?.type} Chart</span>
                        </div>
                        <span className="text-xs font-semibold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-black/5">
                          {dashboard.main_chart?.data?.length || 0} Data Points
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-start gap-4">
                        {dashboard.main_chart?.data?.map((metric: any, idx: number) => {
                          const heightPercent = mainChartMax > 0 ? (metric.value / mainChartMax) * 100 : 0;
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-28 text-xs font-semibold text-zinc-600 truncate text-right">{metric.label}</div>
                              <div className="flex-1 h-9 bg-zinc-50 rounded-full flex items-center border border-black/5 p-1 relative overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(heightPercent, 4)}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                                  className="h-full bg-black rounded-full shadow-sm absolute left-1"
                                />
                                <span className={cn(
                                  "text-[12px] font-bold tracking-tight absolute z-10 transition-colors", 
                                  heightPercent > 20 ? "text-white left-4" : "text-zinc-800 left-8"
                                )} style={{ left: heightPercent > 20 ? 16 : `calc(${Math.max(heightPercent, 4)}% + 12px)` }}>
                                  {metric.value.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Secondary Chart & Recent Insights */}
                    <div className="flex flex-col gap-6">
                      {/* Secondary Chart */}
                      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-1">
                        <h4 className="font-extrabold text-base text-zinc-900 tracking-tight mb-0.5">{dashboard.secondary_chart?.title}</h4>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-5">{dashboard.secondary_chart?.type} Breakdown</span>
                        
                        <div className="flex flex-col gap-3.5">
                          {dashboard.secondary_chart?.data?.map((metric: any, idx: number) => {
                            const pct = secondaryChartMax > 0 ? (metric.value / secondaryChartMax) * 100 : 0;
                            return (
                              <div key={idx} className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-zinc-600 truncate mr-2">{metric.label}</span>
                                  <span className="text-zinc-900 font-extrabold">{metric.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full bg-black rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Activity & Insights */}
                      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-1">
                        <h4 className="font-extrabold text-base text-zinc-900 tracking-tight mb-4">Quick Insights</h4>
                        <div className="flex flex-col gap-3">
                          {dashboard.recent_activity?.map((activity: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2.5 bg-zinc-50/70 p-3 rounded-2xl border border-black/[0.03]">
                              <div className="w-5 h-5 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0 mt-0.5">
                                <Activity size={11} className="text-zinc-500" />
                              </div>
                              <p className="text-[12px] text-zinc-700 leading-relaxed font-semibold">{activity.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
