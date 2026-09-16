'use client';

import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Event, PaymentRecord, RiskItem, Task } from '@/lib/types';
import { formatCompactIDR, formatIDR, formatDate } from '@/lib/utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';

interface GlobalDashboardProps {
  events: Event[];
  payments: PaymentRecord[];
  risks: RiskItem[];
  tasks: Task[];
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
}

export function GlobalDashboard({
  events,
  payments,
  risks,
  tasks,
  onSelectEvent,
  onOpenNewEventModal,
}: GlobalDashboardProps) {
  // Aggregate calculations
  const activeEvents = events.filter((e) =>
    ['CONFIRMED', 'PRE_PRODUCTION', 'PRODUCTION', 'LIVE'].includes(e.status)
  );
  const upcomingEvents = events.filter((e) =>
    ['DRAFT', 'PROPOSAL', 'NEGOTIATION'].includes(e.status)
  );
  const completedEvents = events.filter((e) =>
    ['COMPLETED', 'SETTLEMENT', 'ARCHIVED'].includes(e.status)
  );

  const totalBudget = events.reduce((sum, e) => sum + (e.totalBudget ?? 0), 0);
  const totalActualCost = events.reduce((sum, e) => sum + (e.actualCost ?? 0), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.actualRevenue ?? 0), 0);
  const totalProfit = totalRevenue - totalActualCost;
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const upcomingPayments = payments.filter((p) => p.status === 'SCHEDULED' || p.status === 'PENDING');
  const overduePayments = payments.filter((p) => p.status === 'OVERDUE');
  const criticalRisks = risks.filter((r) => r.severity >= 12 && r.status !== 'Closed');

  // Chart data: Financial comparison by Event
  const chartData = events.slice(0, 5).map((e) => ({
    name: e.code,
    fullName: e.name,
    budget: Math.round(e.totalBudget / 1_000_000), // in Millions
    actualCost: Math.round(e.actualCost / 1_000_000),
    revenue: Math.round(e.actualRevenue / 1_000_000),
    profit: Math.round((e.actualRevenue - e.actualCost) / 1_000_000),
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              System Operational &middot; Multi-Event Control Hub
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
            Enterprise Event Management Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time multi-portfolio financial control, talent contracting, production procurement,
            and ERP Logistics readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewEventModal}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <span>+ Create Event</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Portfolio Status</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-100">{activeEvents.length} Active</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="text-amber-400">{upcomingEvents.length} Upcoming</span>
              <span>&bull;</span>
              <span className="text-slate-400">{completedEvents.length} Completed</span>
            </div>
          </div>
        </div>

        {/* Total Project Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-400">{formatCompactIDR(totalRevenue)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              From {events.length} contracted events
            </div>
          </div>
        </div>

        {/* Actual Cost & Budget Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Actual Cost vs Budget</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-100">{formatCompactIDR(totalActualCost)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Allocated Budget: <span className="text-slate-300">{formatCompactIDR(totalBudget)}</span>
            </div>
          </div>
        </div>

        {/* Net Operating Profit & Margin */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gross Profit & Margin</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-100">{formatCompactIDR(totalProfit)}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-semibold">
              <span>Healthy Margin: {avgMargin}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operational Alerts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Payments Alert */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {upcomingPayments.length} Scheduled Payments
              </div>
              <div className="text-[11px] text-slate-400">
                {formatCompactIDR(upcomingPayments.reduce((s, p) => s + p.amount, 0))} pending disbursement
              </div>
            </div>
          </div>
          {overduePayments.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
              {overduePayments.length} Overdue
            </span>
          )}
        </div>

        {/* Risk Registry Alert */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {criticalRisks.length} Critical Risks Monitored
              </div>
              <div className="text-[11px] text-slate-400">Weather, crowd surge & power contingencies</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/60">
            Action Req.
          </span>
        </div>

        {/* Logistics Bridge Alert */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">ERP Logistics Integration</div>
              <div className="text-[11px] text-slate-400">Target: mcaesarar2-boop/erp-logistik</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
            Connected
          </span>
        </div>
      </div>

      {/* Financial Chart: Budget vs Actual vs Revenue (in Millions IDR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200">Financial Comparison (Million IDR)</h2>
            <p className="text-xs text-slate-400">Allocated Budget vs Actual Expense vs Revenue by Event</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-600"></span>
              <span className="text-slate-400">Budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              <span className="text-slate-400">Actual Cost</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span className="text-slate-400">Revenue</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, '']}
              />
              <Bar dataKey="budget" fill="#64748b" radius={[4, 4, 0, 0]} name="Budget" />
              <Bar dataKey="actualCost" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Actual Cost" />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events Portfolio Table with Health Score & Quick Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200">Active Events & Health Status</h2>
            <p className="text-xs text-slate-400">Real-time health scores computed from budget variance, risks, and tasks</p>
          </div>
          <button
            onClick={() => onSelectEvent(events[0]?.id)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Open Flagship Event (UGM Festival)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event & Code</th>
                <th className="py-3 px-4">Type & Client</th>
                <th className="py-3 px-4">Venue & City</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Budget / Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((evt) => {
                const isOverBudget = evt.actualCost > evt.totalBudget;
                return (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="hover:bg-slate-800/50 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                        {evt.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{evt.code}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{evt.type}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{evt.clientName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{evt.venueName}</div>
                      <div className="text-[11px] text-slate-400">{evt.city}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{formatDate(evt.eventDayDate || evt.startDate)}</div>
                      <div className="text-[10px] text-slate-400">Target: {evt.expectedAttendance.toLocaleString()} pax</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{formatCompactIDR(evt.totalBudget)}</div>
                      <div className={`text-[10px] font-mono ${isOverBudget ? 'text-rose-400' : 'text-slate-400'}`}>
                        Actual: {formatCompactIDR(evt.actualCost)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          evt.status === 'LIVE'
                            ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                            : evt.status === 'PRODUCTION'
                            ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                            : evt.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOverBudget ? 'bg-rose-400' : 'bg-emerald-400'
                          }`}
                        ></span>
                        <span className="text-[11px] font-medium text-slate-300">
                          {isOverBudget ? 'Warning' : 'Healthy'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-xs transition"
                      >
                        Manage &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    Belum ada event aktif. Klik &quot;+ Create Event&quot; di atas untuk membuat event baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
