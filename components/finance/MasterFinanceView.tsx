'use client';

import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Event, BudgetItem, RevenueItem, PurchaseOrder, PaymentRecord } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface MasterFinanceViewProps {
  events: Event[];
  budgetItems: BudgetItem[];
  revenues: RevenueItem[];
  purchaseOrders: PurchaseOrder[];
  payments: PaymentRecord[];
  onSelectEvent: (eventId: string) => void;
}

export function MasterFinanceView({
  events,
  budgetItems,
  revenues,
  purchaseOrders,
  payments,
  onSelectEvent,
}: MasterFinanceViewProps) {
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'BUDGETS' | 'REVENUES' | 'PAYMENTS'>('OVERVIEW');

  // Filter items based on selected event
  const filteredBudgetItems = selectedEventFilter === 'ALL'
    ? budgetItems
    : budgetItems.filter((b) => b.eventId === selectedEventFilter);

  const filteredRevenues = selectedEventFilter === 'ALL'
    ? revenues
    : revenues.filter((r) => r.eventId === selectedEventFilter);

  const filteredPayments = selectedEventFilter === 'ALL'
    ? payments
    : payments.filter((p) => p.eventId === selectedEventFilter);

  const filteredEvents = selectedEventFilter === 'ALL'
    ? events
    : events.filter((e) => e.id === selectedEventFilter);

  // Financial Metrics
  const totalAllocatedBudget = filteredEvents.reduce((sum, e) => sum + (e.totalBudget || 0), 0);
  const totalEstimatedCost = filteredBudgetItems.reduce((sum, b) => sum + (b.estimatedTotal || 0), 0);
  const totalActualCost = filteredBudgetItems.reduce((sum, b) => sum + (b.actualTotal || 0), 0);
  const totalCommittedPO = purchaseOrders
    .filter((po) => selectedEventFilter === 'ALL' || po.eventId === selectedEventFilter)
    .filter((po) => po.status !== 'Cancelled')
    .reduce((sum, po) => sum + (po.total || 0), 0);

  const totalRevenueContract = filteredRevenues.reduce((sum, r) => sum + (r.actualRevenue || 0), 0);
  const totalRevenueReceived = filteredRevenues.reduce((sum, r) => sum + (r.received || 0), 0);
  const totalRevenueOutstanding = totalRevenueContract - totalRevenueReceived;

  const grossProfit = totalRevenueContract - totalActualCost;
  const grossMargin = totalRevenueContract > 0 ? ((grossProfit / totalRevenueContract) * 100).toFixed(1) : '0';

  const totalDisbursed = filteredPayments
    .filter((p) => p.status === 'PAID' || p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPendingPayments = filteredPayments
    .filter((p) => p.status !== 'PAID' && p.status !== 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            FINANCE & COMMERCIAL ENGINE
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Master Finance & Budget Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Konsolidasi P&L, realisasi anggaran produksi, arus kas pendapatan, dan komitmen PO lintas portofolio event.
          </p>
        </div>

        {/* Global Event Selector Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Filter Event:</span>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Portofolio Event ({events.length})</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                  {ev.name} ({ev.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>TOTAL CONTRACTED REVENUE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatIDR(totalRevenueContract)}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <span>Diterima: {formatCompactIDR(totalRevenueReceived)}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">Piutang: {formatCompactIDR(totalRevenueOutstanding)}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>REALISASI BIAYA PRODUKSI</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatIDR(totalActualCost)}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <span>Budget Cap: {formatCompactIDR(totalAllocatedBudget)}</span>
            <span className="text-slate-500">•</span>
            <span className={totalActualCost > totalAllocatedBudget ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
              {totalActualCost > totalAllocatedBudget ? 'Over-Budget' : 'Within Budget'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>GROSS PROFIT & MARGIN</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{formatIDR(grossProfit)}</div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 mt-2">
            <span className="font-semibold">{grossMargin}% Margin Keuntungan</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">PO: {formatCompactIDR(totalCommittedPO)}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>DISBURSED CASH FLOW</span>
            <ArrowUpRight className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatIDR(totalDisbursed)}</div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2">
            <span>Menunggu Pembayaran: {formatCompactIDR(totalPendingPayments)}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto touch-scroll no-scrollbar">
        {(['OVERVIEW', 'BUDGETS', 'REVENUES', 'PAYMENTS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
              activeSubTab === tab
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab === 'OVERVIEW' && 'Ringkasan P&L Per Event'}
            {tab === 'BUDGETS' && `Line Item Anggaran (${filteredBudgetItems.length})`}
            {tab === 'REVENUES' && `Arus Pendapatan & Piutang (${filteredRevenues.length})`}
            {tab === 'PAYMENTS' && `Jadwal Kas Keluar (${filteredPayments.length})`}
          </button>
        ))}
      </div>

      {/* TAB 1: P&L PER EVENT TABLE */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Profit & Loss Breakdown Per Portfolio Event</h2>
              <p className="text-xs text-slate-400 mt-0.5">Analisis pendapatan kontrak vs realisasi pengeluaran dan margin bersih.</p>
            </div>
          </div>
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs text-slate-300 min-w-[850px]">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Event & Client</th>
                  <th className="py-3.5 px-4 font-semibold">Tanggal</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Plafon Budget</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Realisasi Biaya</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Target Revenue</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Gross Profit</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Margin</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvents.map((evt) => {
                  const evBudgets = budgetItems.filter((b) => b.eventId === evt.id);
                  const evRevenues = revenues.filter((r) => r.eventId === evt.id);
                  const actCost = evBudgets.reduce((s, b) => s + (b.actualTotal ?? 0), 0) || (evt.actualCost ?? 0);
                  const revContract = evRevenues.reduce((s, r) => s + (r.actualRevenue ?? 0), 0) || (evt.actualRevenue ?? 0);
                  const profit = revContract - actCost;
                  const margin = revContract > 0 ? ((profit / revContract) * 100).toFixed(1) : '0';

                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{evt.name}</div>
                        <div className="text-[11px] text-slate-400">{evt.clientName} • <span className="font-mono">{evt.code}</span></div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        {formatDate(evt.eventDayDate || evt.startDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatCompactIDR(evt.totalBudget)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400 font-medium">
                        {formatCompactIDR(actCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-medium">
                        {formatCompactIDR(revContract)}
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
                          Workspace
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
      )}

      {/* TAB 2: LINE ITEMS BUDGET */}
      {activeSubTab === 'BUDGETS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Daftar Detail Line Item Anggaran Biaya Produksi</h2>
              <p className="text-xs text-slate-400 mt-0.5">Menampilkan perbandingan estimasi awal vs realisasi biaya aktual.</p>
            </div>
          </div>
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Deskripsi Item</th>
                  <th className="py-3.5 px-4 font-semibold">Kategori</th>
                  <th className="py-3.5 px-4 font-semibold">Event</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Vol & Satuan</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Estimasi (IDR)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Realisasi (IDR)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBudgetItems.map((item) => {
                  const ev = events.find((e) => e.id === item.eventId);
                  const isOver = item.actualTotal > item.estimatedTotal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{item.description}</div>
                        {item.vendorName && <div className="text-[11px] text-indigo-400">Vendor: {item.vendorName}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-[150px]" title={ev?.name}>
                        {ev?.name || 'All'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatIDR(item.estimatedTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400 font-semibold">
                        {formatIDR(item.actualTotal)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatIDR(item.variance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUES & RECEIVABLES */}
      {activeSubTab === 'REVENUES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Monitoring Arus Kas Pendapatan & Tagihan Sponsor / Tiket</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pantau realisasi pembayaran kontrak, DP, serta outstanding receivable.</p>
            </div>
          </div>
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Kategori & Sumber</th>
                  <th className="py-3.5 px-4 font-semibold">Event</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Nilai Kontrak</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sudah Diterima</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sisa Piutang</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRevenues.map((rev) => {
                  const ev = events.find((e) => e.id === rev.eventId);
                  const isPaidFull = rev.received >= rev.actualRevenue;
                  return (
                    <tr key={rev.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{rev.description}</div>
                        <div className="text-[11px] text-indigo-400">{rev.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{ev?.name || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-white font-medium">
                        {formatIDR(rev.actualRevenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                        {formatIDR(rev.received)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-medium">
                        {formatIDR(rev.outstanding)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isPaidFull
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : rev.received > 0
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isPaidFull ? 'LUNAS (Paid Full)' : rev.received > 0 ? 'DP Diterima (Partial)' : 'Menunggu Pelunasan'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CASH OUT PAYMENTS */}
      {activeSubTab === 'PAYMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Log Pembayaran Kas & Jadwal Disbursment</h2>
              <p className="text-xs text-slate-400 mt-0.5">Penyaluran dana ke vendor, artis, honorarium crew, dan sewa venue.</p>
            </div>
          </div>
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Penerima (Payee)</th>
                  <th className="py-3.5 px-4 font-semibold">Event</th>
                  <th className="py-3.5 px-4 font-semibold">Tipe</th>
                  <th className="py-3.5 px-4 font-semibold">Metode</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Jumlah (IDR)</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{pay.payee}</div>
                      <div className="text-[11px] text-slate-400">{pay.notes}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{pay.eventName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-slate-700">
                        {pay.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">{pay.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-white font-bold">
                      {formatIDR(pay.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        pay.status === 'PAID' || pay.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
