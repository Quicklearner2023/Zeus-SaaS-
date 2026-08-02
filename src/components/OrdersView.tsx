/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Bot, 
  DollarSign, 
  MapPin, 
  User, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DB } from '@/services/gemini';

interface OrdersViewProps {
  onAction: (msg?: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const orders = MOCK_DB.orders || [];

  // Calculate KPIs
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const delayedCount = orders.filter(o => o.status === 'Delayed').length;
  const refundedCount = orders.filter(o => o.status === 'Refunded').length;

  // Filter & Sort
  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
        const matchesStatus = statusFilter === 'all' || o.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = 
          !searchTerm ||
          o.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.city?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [orders, searchTerm, statusFilter, sortBy]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Database size={13} className="text-zinc-500" /> Real-time Database
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Order Management</h2>
            <p className="text-zinc-500 text-[14px] font-medium mt-0.5">Live store transactions from the Olist E-Commerce dataset.</p>
          </div>

          <button 
            onClick={() => onAction("Analyze overall order performance and identify delayed shipments.")}
            className="px-4 py-2.5 bg-black text-white rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Sparkles size={14} />
            <span>Ask Agent to Audit Orders</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Volume</span>
            <div className="text-xl font-extrabold text-zinc-900 mt-1">{totalOrders}</div>
            <span className="text-[10px] text-zinc-400 font-medium">Orders logged</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">${totalRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-400 font-medium">Gross sales value</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Delivered</span>
            <div className="text-xl font-extrabold text-zinc-900 mt-1 flex items-center gap-2">
              <span>{deliveredCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                {totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0}%
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">Fulfilled</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Delayed</span>
            <div className="text-xl font-extrabold text-amber-600 mt-1 flex items-center gap-2">
              <span>{delayedCount}</span>
              {delayedCount > 0 && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Attention
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">Behind schedule</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Refunded</span>
            <div className="text-xl font-extrabold text-zinc-700 mt-1">{refundedCount}</div>
            <span className="text-[10px] text-zinc-400 font-medium">Returned payments</span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-3 md:p-4 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Order ID, Customer, or City..."
              className="w-full bg-zinc-50 border border-black/5 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-black/5 text-xs font-medium">
              {(['all', 'Delivered', 'Delayed', 'Refunded'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1 rounded-full capitalize text-[11px] transition-all font-semibold",
                    statusFilter === status 
                      ? "bg-white text-black shadow-sm" 
                      : "text-zinc-500 hover:text-black"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-zinc-50 border border-black/5 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-700 outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid gap-3.5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-black/[0.04]">
              <p className="text-zinc-400 font-semibold text-sm">No orders match your filter criteria.</p>
              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} 
                className="mt-3 text-xs text-black font-bold underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order, i) => (
              <div key={i} className="bg-white p-5 md:p-6 rounded-3xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-black/10">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-base text-zinc-900 tracking-tight">{order.order_id}</span>
                    <span className="px-3 py-0.5 bg-zinc-100 rounded-full text-[11px] font-semibold text-zinc-600 border border-black/5 flex items-center gap-1">
                      <MapPin size={10} /> {order.city}
                    </span>
                    <span className={cn(
                      "px-3 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1",
                      order.status === 'Delivered' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : 
                      order.status === 'Delayed' ? "bg-amber-50 border-amber-200 text-amber-800" :
                      order.status === 'Refunded' ? "bg-zinc-100 border-black/10 text-zinc-600" :
                      "bg-white border-black/10 text-zinc-900"
                    )}>
                      {order.status === 'Delivered' && <CheckCircle2 size={11} />}
                      {order.status === 'Delayed' && <AlertTriangle size={11} />}
                      {order.status === 'Refunded' && <RefreshCw size={11} />}
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-zinc-600 pt-1">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Customer</span>
                      <strong className="text-zinc-900 font-semibold truncate block">{order.customer_id}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Amount</span>
                      <strong className="text-emerald-600 font-extrabold text-sm">${order.amount.toLocaleString()}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Purchase Date</span>
                      <strong className="text-zinc-700 font-semibold">{new Date(order.date).toLocaleDateString()}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Delivered On</span>
                      <strong className="text-zinc-700 font-semibold">
                        {order.delivered_date ? new Date(order.delivered_date).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Direct Agent Actions */}
                <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-black/[0.04] pt-3 md:pt-0 md:pl-4">
                  {order.status === 'Delayed' && (
                    <button 
                      onClick={() => onAction(`Investigate delivery delays for order ${order.order_id} in ${order.city}.`)}
                      className="px-3.5 py-1.5 text-[11px] font-semibold rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                    >
                      <Bot size={12} />
                      <span>Investigate Delay</span>
                    </button>
                  )}

                  {order.status !== 'Refunded' && (
                    <button 
                      onClick={() => onAction(`Issue full refund of $${order.amount} for order ${order.order_id} due to customer request.`)}
                      className="px-3.5 py-1.5 text-[11px] font-semibold rounded-full bg-zinc-100 hover:bg-black hover:text-white text-zinc-800 transition-all border border-black/5 flex items-center gap-1.5"
                    >
                      <DollarSign size={12} />
                      <span>Refund Order</span>
                    </button>
                  )}

                  <button 
                    onClick={() => onAction(`Analyze customer history for ${order.customer_id} and order ${order.order_id}.`)}
                    className="px-3.5 py-1.5 text-[11px] font-semibold rounded-full bg-zinc-50 hover:bg-zinc-200 text-zinc-600 transition-all border border-black/5 flex items-center gap-1.5"
                  >
                    <span>Inspect Order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
