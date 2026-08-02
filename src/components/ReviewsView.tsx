/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  User, 
  Sparkles, 
  Search, 
  Star, 
  Bot, 
  MessageSquare, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DB } from '@/services/gemini';

interface ReviewsViewProps {
  onAction: (msg?: string) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ onAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScore, setSelectedScore] = useState<number | 'all'>('all');

  const reviews = MOCK_DB.reviews || [];
  const responses = MOCK_DB.customer_responses || [];

  // Metrics
  const totalReviews = reviews.length;
  const avgScore = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.score, 0) / totalReviews).toFixed(1) : '0.0';
  const lowRatingCount = reviews.filter(r => r.score <= 2).length;
  const highRatingCount = reviews.filter(r => r.score >= 4).length;

  // Filter
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesScore = selectedScore === 'all' || r.score === selectedScore;
      const matchesSearch = 
        !searchTerm ||
        r.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.text?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesScore && matchesSearch;
    });
  }, [reviews, searchTerm, selectedScore]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Briefcase size={13} className="text-zinc-500" /> Sentiment Analytics
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Customer Reviews</h2>
            <p className="text-zinc-500 text-[14px] font-medium mt-0.5">Monitor store sentiment, low ratings, and automated response drafts.</p>
          </div>

          <button 
            onClick={() => onAction("Analyze low review ratings and summarize major complaints.")}
            className="px-4 py-2.5 bg-black text-white rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Sparkles size={14} />
            <span>Ask Agent to Audit Reviews</span>
          </button>
        </div>

        {/* Sentiment KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Avg Satisfaction</span>
            <div className="text-xl font-extrabold text-zinc-900 mt-1 flex items-center gap-2">
              <span>{avgScore} / 5.0</span>
              <div className="flex">
                <Star size={14} className="text-amber-400 fill-amber-400" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">Overall score</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Feedback</span>
            <div className="text-xl font-extrabold text-zinc-900 mt-1">{totalReviews}</div>
            <span className="text-[10px] text-zinc-400 font-medium">Reviews recorded</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Critical (1-2★)</span>
            <div className="text-xl font-extrabold text-red-600 mt-1 flex items-center gap-2">
              <span>{lowRatingCount}</span>
              {lowRatingCount > 0 && (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  Needs Action
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">Negative sentiment</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Positive (4-5★)</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">{highRatingCount}</div>
            <span className="text-[10px] text-zinc-400 font-medium">Satisfied buyers</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 md:p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Customer, Review text, Order ID..."
              className="w-full bg-zinc-50 border border-black/5 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-black/5 text-xs font-semibold overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setSelectedScore('all')}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] transition-all",
                selectedScore === 'all' ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"
              )}
            >
              All Stars
            </button>
            {[1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                onClick={() => setSelectedScore(score)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] transition-all flex items-center gap-1",
                  selectedScore === score ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"
                )}
              >
                <span>{score}</span>
                <Star size={10} className={score <= 2 ? "text-red-500 fill-red-500" : "text-amber-400 fill-amber-400"} />
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid gap-3.5">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-black/[0.04]">
              <p className="text-zinc-400 font-semibold text-sm">No reviews found matching your search criteria.</p>
            </div>
          ) : (
            filteredReviews.map((review, i) => {
              const draftedResponse = responses.find(resp => resp.review_id === review.review_id);

              return (
                <div key={i} className="bg-white p-5 md:p-6 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start gap-4 transition-all hover:border-black/10">
                  <div className="flex gap-4 max-w-full md:max-w-[75%]">
                    <div className="w-10 h-10 bg-zinc-100 rounded-2xl flex items-center justify-center border border-black/5 shrink-0 text-zinc-500 mt-1">
                      <User size={18} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-zinc-900">{review.customer_id}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-400 font-medium">{new Date(review.date).toLocaleDateString()}</span>
                        <span className="px-2.5 py-0.5 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-600 uppercase tracking-wider border border-black/5 flex items-center gap-1">
                          <Tag size={10} /> {review.product_category}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={star <= review.score ? "text-amber-400 fill-amber-400" : "text-zinc-200"} 
                          />
                        ))}
                        <span className="text-xs font-bold text-zinc-700 ml-1.5">{review.score}.0 / 5.0</span>
                      </div>

                      {/* Review Text */}
                      <p className="text-zinc-800 text-[14px] leading-relaxed font-medium bg-zinc-50/50 p-3.5 rounded-2xl border border-black/[0.03]">
                        "{review.text}"
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-500 pt-1">
                        <span>Order Reference: <strong className="text-zinc-900 font-bold">{review.order_id}</strong></span>
                      </div>

                      {/* Saved Response Preview */}
                      {draftedResponse && (
                        <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                            <Bot size={13} />
                            <span>AI Response Drafted</span>
                          </div>
                          <p className="text-emerald-950 font-medium leading-relaxed">
                            "{draftedResponse.response_text}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-black/[0.04] pt-3 md:pt-0 md:pl-4">
                    <button 
                      onClick={() => onAction(`Draft a polite, professional response to review ${review.review_id} from customer ${review.customer_id}. Address their feedback about ${review.product_category}.`)} 
                      className="px-4 py-2 text-xs font-semibold rounded-full bg-black text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Bot size={13} />
                      <span>{draftedResponse ? 'Redraft Response' : 'Draft Response'}</span>
                    </button>

                    {review.score <= 2 && (
                      <button 
                        onClick={() => onAction(`Find order ${review.order_id} for dissatisfied customer ${review.customer_id} and issue a full refund.`)} 
                        className="px-4 py-2 text-xs font-semibold rounded-full bg-red-50 hover:bg-red-100 text-red-700 transition-colors border border-red-200 flex items-center gap-1.5"
                      >
                        <DollarSign size={13} />
                        <span>Refund Customer</span>
                      </button>
                    )}
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
