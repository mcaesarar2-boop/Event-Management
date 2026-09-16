'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Event, BudgetItem, RevenueItem, RiskItem } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface EventReportsTabProps {
  event: Event;
  budgetItems: BudgetItem[];
  revenueItems: RevenueItem[];
  risks: RiskItem[];
}

export function EventReportsTab({
  event,
  budgetItems,
  revenueItems,
  risks,
}: EventReportsTabProps) {
  const totalRevenue = revenueItems.reduce((sum, r) => sum + (r.actualRevenue || 0), 0);
  const totalActualCost = budgetItems.reduce((sum, b) => sum + (b.actualTotal ?? 0), 0);
  const totalEstimatedCost = budgetItems.reduce((sum, b) => sum + (b.estimatedTotal ?? 0), 0);
  const grossProfit = totalRevenue - totalActualCost;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
  const costVariance = totalEstimatedCost - totalActualCost;

  const exportCSV = () => {
    const lines = [
      `EVENT FINANCIAL & PRODUCTION POST-MORTEM REPORT`,
      `Event Name,${event.name}`,
      `Code,${event.code}`,
      `Client,${event.clientName}`,
      `Venue,${event.venueName}, ${event.city}`,
      `Date,${formatDate(event.eventDayDate || event.startDate)}`,
      ``,
      `FINANCIAL SUMMARY`,
      `Total Gross Revenue,${totalRevenue}`,
      `Total Production Cost,${totalActualCost}`,
      `Budget Cap / Estimated,${totalEstimatedCost}`,
      `Gross Profit,${grossProfit}`,
      `Profit Margin,${profitMargin}%`,
      `Cost Variance,${costVariance}`,
      ``,
      `REVENUE BREAKDOWN`,
      `Category,Description,Target,Actual Contract,Received`,
      ...revenueItems.map(
        (r) =>
          `"${r.category}","${r.description.replace(/"/g, '""')}",${r.estimatedRevenue ?? r.targetRevenue ?? r.actualRevenue ?? 0},${r.actualRevenue},${r.received}`
      ),
      ``,
      `EXPENSE BREAKDOWN`,
      `Category,Line Item,Estimated,Actual,Variance`,
      ...budgetItems.map(
        (b) =>
          `"${b.category}","${(b.description || 'Item').replace(/"/g, '""')}",${b.estimatedTotal ?? 0},${b.actualTotal ?? 0},${b.variance}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${event.code}_PNL.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Executive P&L Statement & Post-Event Diagnostic
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full comprehensive financial audit, revenue vs cost margin, and operational health metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export P&L CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Gross Realized Revenue</div>
          <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">{formatCompactIDR(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {revenueItems.length} streams collected
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Actual Production Costs</div>
          <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">{formatCompactIDR(totalActualCost)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Budget Cap: {formatCompactIDR(totalEstimatedCost)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Gross Profit / Net Margin</div>
          <div
            className={`text-2xl font-bold mt-2 font-mono ${
              grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCompactIDR(grossProfit)}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-mono font-bold">
            Margin: {profitMargin}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Attendance & Reach</div>
          <div className="text-2xl font-bold text-indigo-300 mt-2 font-mono">
            {event.expectedAttendance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target capacity achieved</div>
        </div>
      </div>

      {/* P&L Detailed Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">PROFIT & LOSS STATEMENT LEDGER</h3>
            <div className="text-xs text-slate-400 mt-0.5">
              {event.name} ({event.code}) &middot; Venue: {event.venueName} &middot;{' '}
              {formatDate(event.eventDayDate || event.startDate)}
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
            Audit Level: Management Ready
          </span>
        </div>

        {/* Section 1: Revenue Breakdown */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>1. Commercial Revenue Inflow</span>
            <span className="font-mono text-sm">{formatIDR(totalRevenue)}</span>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2 text-xs">
            {revenueItems.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{r.description}</span>
                  <span className="text-slate-500 ml-2">({r.category})</span>
                </div>
                <div className="font-mono font-bold text-slate-200">{formatIDR(r.actualRevenue)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Cost of Goods & Production */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>2. Production & Operational Expenses</span>
            <span className="font-mono text-sm">{formatIDR(totalActualCost)}</span>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2 text-xs">
            {budgetItems.map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{b.description || 'Item'}</span>
                  <span className="text-slate-500 ml-2">({b.category})</span>
                </div>
                <div className="font-mono text-slate-200">{formatIDR(b.actualTotal ?? 0)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Net Bottom Line Summary */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Total Commercial Inflow:</span>
            <span className="text-slate-200">{formatIDR(totalRevenue)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Production Outflow:</span>
            <span className="text-slate-200">({formatIDR(totalActualCost)})</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-base">
            <span className="text-slate-100">NET EVENT GROSS PROFIT:</span>
            <span className={grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatIDR(grossProfit)} ({profitMargin}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
