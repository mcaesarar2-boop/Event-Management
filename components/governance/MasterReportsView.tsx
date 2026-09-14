'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Award,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Event, BudgetItem, RevenueItem, RiskItem, Task } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface MasterReportsViewProps {
  events: Event[];
  budgetItems: BudgetItem[];
  revenues: RevenueItem[];
  risks: RiskItem[];
  tasks: Task[];
  onSelectEvent: (eventId: string) => void;
}

export function MasterReportsView({
  events,
  budgetItems,
  revenues,
  risks,
  tasks,
  onSelectEvent,
}: MasterReportsViewProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');

  const filteredEvents = selectedEventId === 'ALL'
    ? events
    : events.filter((e) => e.id === selectedEventId);

  const filteredBudgets = selectedEventId === 'ALL'
    ? budgetItems
    : budgetItems.filter((b) => b.eventId === selectedEventId);

  const filteredRevenues = selectedEventId === 'ALL'
    ? revenues
    : revenues.filter((r) => r.eventId === selectedEventId);

  const totalContractRevenue = filteredRevenues.reduce((sum, r) => sum + (r.actualRevenue || 0), 0);
  const totalActualCost = filteredBudgets.reduce((sum, b) => sum + (b.actualTotal || 0), 0);
  const totalGrossProfit = totalContractRevenue - totalActualCost;
  const overallMargin = totalContractRevenue > 0 ? ((totalGrossProfit / totalContractRevenue) * 100).toFixed(1) : '0';

  const exportCSV = () => {
    const lines = [
      `ENTERPRISE EXECUTIVE POST-MORTEM & P&L REPORT`,
      `Export Timestamp,${new Date().toISOString()}`,
      `Total Events Analyzed,${filteredEvents.length}`,
      ``,
      `CONSOLIDATED FINANCIAL SUMMARY`,
      `Gross Contracted Revenue,${totalContractRevenue}`,
      `Actual Production Cost,${totalActualCost}`,
      `Consolidated Gross Profit,${totalGrossProfit}`,
      `Average Profit Margin,${overallMargin}%`,
      ``,
      `EVENT BREAKDOWN TABLE`,
      `Event Name,Code,Client,Venue,Date,Revenue,Production Cost,Gross Profit,Margin %`,
      ...filteredEvents.map((e) => {
        const evBudgets = budgetItems.filter((b) => b.eventId === e.id);
        const evRevs = revenues.filter((r) => r.eventId === e.id);
        const rev = evRevs.reduce((s, r) => s + (r.actualRevenue || 0), 0) || e.actualRevenue;
        const cost = evBudgets.reduce((s, b) => s + (b.actualTotal || 0), 0) || e.actualCost;
        const profit = rev - cost;
        const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0';
        return `"${e.name}","${e.code}","${e.clientName}","${e.venueName}","${formatDate(e.eventDayDate || e.startDate)}",${rev},${cost},${profit},${margin}%`;
      }),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-pnl-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            BUSINESS INTELLIGENCE & ANALYTICS
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Reports & Post-Mortem P&L</h1>
          <p className="text-sm text-slate-400 mt-1">
            Laporan pertanggungjawaban komprehensif: evaluasi laba kotor portofolio, audit efisiensi anggaran, dan ekspor CSV audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Pilih Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Portofolio Event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                  {ev.name} ({ev.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">TOTAL REVENUE KONTRAK</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{formatIDR(totalContractRevenue)}</div>
          <div className="text-xs text-slate-400 mt-1">Sponsorship, Tiket, & Project Fee</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">TOTAL BIAYA PRODUKSI REAL</div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{formatIDR(totalActualCost)}</div>
          <div className="text-xs text-slate-400 mt-1">Realisasi Pengeluaran Vendor & Crew</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">CONSOLIDATED GROSS PROFIT</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{formatIDR(totalGrossProfit)}</div>
          <div className="text-xs text-emerald-400 mt-1">Net Surplus Operasional</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">AVERAGE PROFIT MARGIN</div>
          <div className="text-2xl font-bold text-white font-mono">{overallMargin}%</div>
          <div className="text-xs text-slate-400 mt-1">Benchmark Industri Konser: &gt;20%</div>
        </div>
      </div>

      {/* Post-Mortem Analytics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Matriks Evaluasi Finansial & Operasional Post-Mortem</h2>
            <p className="text-xs text-slate-400 mt-0.5">Analisis efisiensi biaya, kepuasan produksi, dan mitigasi kendala.</p>
          </div>
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Event & Klien</th>
                <th className="py-3.5 px-4 font-semibold">Venue & Tanggal</th>
                <th className="py-3.5 px-4 font-semibold text-right">Target Audiens</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Revenue</th>
                <th className="py-3.5 px-4 font-semibold text-right">Biaya Aktual</th>
                <th className="py-3.5 px-4 font-semibold text-right">Laba Kotor</th>
                <th className="py-3.5 px-4 font-semibold text-center">Margin</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((evt) => {
                const evBudgets = budgetItems.filter((b) => b.eventId === evt.id);
                const evRevs = revenues.filter((r) => r.eventId === evt.id);
                const rev = evRevs.reduce((s, r) => s + (r.actualRevenue || 0), 0) || evt.actualRevenue;
                const cost = evBudgets.reduce((s, b) => s + (b.actualTotal || 0), 0) || evt.actualCost;
                const profit = rev - cost;
                const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0';

                return (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{evt.name}</div>
                      <div className="text-[11px] text-slate-400">{evt.clientName} • <span className="font-mono">{evt.code}</span></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{evt.venueName}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(evt.eventDayDate || evt.startDate)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {evt.expectedAttendance.toLocaleString('id-ID')} pax
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                      {formatIDR(rev)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-400 font-medium">
                      {formatIDR(cost)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatIDR(profit)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] ${
                        Number(margin) >= 20
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : Number(margin) > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectEvent(evt.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                      >
                        Buka Post-Mortem
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
