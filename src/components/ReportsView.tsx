/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Check, 
  TrendingUp, 
  ArrowRight,
  Bot,
  BarChart2,
  Calendar
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { MOCK_DB } from '@/services/gemini';

interface ReportsViewProps {
  onAction: (msg?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onAction }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const reports = MOCK_DB.reports || [];

  const handleCopyReport = (report: any, idx: number) => {
    const text = `${report.title} (${report.year})\n\nExecutive Summary:\n${report.executive_summary}\n\nKey Insights:\n${report.key_insights?.join('\n')}\n\nRecommendations:\n${report.recommendations?.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Search size={13} className="text-zinc-500" /> AI Executive Intelligence
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Executive Reports</h2>
            <p className="text-zinc-500 text-[14px] font-medium mt-0.5">Comprehensive multi-parameter business reports compiled by the Gemini Agent.</p>
          </div>

          <button 
            onClick={() => onAction("Write a comprehensive performance report analyzing 2017 e-commerce sales and regional order metrics.")} 
            className="px-5 py-2.5 bg-black text-white rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Sparkles size={14} />
            <span>Generate New Report</span>
          </button>
        </div>

        {/* Preset Prompt Triggers Bar */}
        <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-zinc-700" />
            <span className="text-xs font-bold text-zinc-800">Quick Report Generator:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onAction("Write a report about sales in São Paulo in 2017.")}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-semibold text-zinc-700 transition-all border border-black/5"
            >
              📊 São Paulo Sales 2017
            </button>
            <button 
              onClick={() => onAction("Write a report on shipping bottlenecks and delivery delays across key states.")}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-semibold text-zinc-700 transition-all border border-black/5"
            >
              🚚 Shipping Bottlenecks
            </button>
            <button 
              onClick={() => onAction("Write a report on customer review sentiment and top satisfaction drivers.")}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-[12px] font-semibold text-zinc-700 transition-all border border-black/5"
            >
              ⭐ Sentiment Analysis
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid gap-8">
          {reports.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.04] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-400 mx-auto">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-zinc-800">No Reports Generated Yet</h3>
              <p className="text-zinc-500 font-medium text-xs max-w-sm mx-auto">
                Ask the Virtual Assistant to generate an executive performance report for any date range, city, or product category.
              </p>
              <button
                onClick={() => onAction("Write a report about sales in São Paulo in 2017.")}
                className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-semibold hover:bg-zinc-800 transition-all inline-flex items-center gap-2"
              >
                <span>Generate São Paulo 2017 Report</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            [...reports].reverse().map((report, i) => (
              <div key={i} className="bg-white rounded-[32px] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                {/* Card Header */}
                <div className="bg-zinc-50/80 px-6 md:px-10 py-5 border-b border-black/[0.04] flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg md:text-xl text-zinc-900 tracking-tight">{report.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                          <Calendar size={11} /> {report.year}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyReport(report, i)}
                    className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 rounded-full text-[11px] font-semibold text-zinc-700 border border-black/10 transition-colors flex items-center gap-1.5"
                  >
                    {copiedIndex === i ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedIndex === i ? 'Copied' : 'Copy Report'}</span>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-10 space-y-8">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="font-extrabold text-zinc-900 mb-2 text-sm uppercase tracking-wider text-zinc-400">Executive Summary</h4>
                    <p className="text-zinc-800 leading-relaxed font-medium text-[14.5px] bg-zinc-50/50 p-5 rounded-2xl border border-black/[0.03]">
                      {report.executive_summary}
                    </p>
                  </div>

                  {/* Key Metrics Row */}
                  {report.metrics && report.metrics.length > 0 && (
                    <div>
                      <h4 className="font-extrabold text-zinc-900 mb-3 text-sm uppercase tracking-wider text-zinc-400">Key Metrics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {report.metrics.filter((m: any) => m.value !== 'N/A' && m.value !== 'n/a').map((m: any, idx: number) => (
                          <div key={idx} className="p-5 bg-zinc-50/70 border border-black/[0.04] rounded-2xl">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">{m.label}</span>
                            <div className="flex items-end gap-2">
                              <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                                {m.label.toLowerCase().includes('revenue') || m.label.toLowerCase().includes('value') || m.label.toLowerCase().includes('price') || m.label.toLowerCase().includes('amount') ? '$' : ''}
                                {m.value?.toLocaleString() || 0}
                              </span>
                              {m.trend && m.trend !== 'N/A' && m.trend !== 'n/a' && (
                                <span className={cn(
                                  "text-xs font-bold mb-1 px-2 py-0.5 rounded-full",
                                  m.trend.startsWith('+') ? "text-emerald-700 bg-emerald-50" : m.trend.startsWith('-') ? "text-red-700 bg-red-50" : "text-zinc-500 bg-zinc-100"
                                )}>
                                  {m.trend}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Analysis */}
                  {report.detailed_analysis && (
                    <div className="border-t border-black/[0.04] pt-6">
                      <h4 className="font-extrabold text-zinc-900 mb-3 text-sm uppercase tracking-wider text-zinc-400">Detailed Analysis</h4>
                      <div className="markdown-body text-zinc-700 text-[14px] leading-relaxed font-medium">
                        <ReactMarkdown>{report.detailed_analysis}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  {/* Insights and Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-black/[0.04] pt-6">
                    <div>
                      <h4 className="font-extrabold text-zinc-900 mb-3 text-sm uppercase tracking-wider text-zinc-400">Key Insights</h4>
                      <div className="space-y-2.5">
                        {report.key_insights?.map((insight: string, idx: number) => (
                          <div key={idx} className="bg-zinc-50 p-4 rounded-2xl flex items-start gap-3 border border-black/[0.03]">
                            <div className="w-5 h-5 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                            </div>
                            <span className="text-zinc-800 font-medium leading-relaxed text-[13px]">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {report.recommendations && (
                      <div>
                        <h4 className="font-extrabold text-zinc-900 mb-3 text-sm uppercase tracking-wider text-zinc-400">Strategic Recommendations</h4>
                        <div className="space-y-2.5">
                          {report.recommendations?.map((rec: string, idx: number) => (
                            <div key={idx} className="bg-black text-white p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles size={12} className="text-white" />
                              </div>
                              <span className="text-zinc-200 font-medium leading-relaxed text-[13px]">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
