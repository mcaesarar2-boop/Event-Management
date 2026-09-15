'use client';

import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Music,
  ShoppingBag,
  Users,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck,
  Handshake,
  Gift,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Event, HealthStatus, SponsorshipItem } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';
import { EventTabType } from './EventDetailHeader';

interface EventOverviewTabProps {
  event: Event;
  health: { score: number; status: HealthStatus; reasons: string[] };
  financials: {
    totalBudget: number;
    estimatedCost: number;
    actualCost: number;
    committedCost: number;
    totalRevenue: number;
    actualRevenue: number;
    receivedRevenue: number;
    grossProfit: number;
    profitMargin: number;
    remainingBudget: number;
    totalPaid: number;
    outstandingPayment: number;
    clientReceivable: number;
    vendorPayable: number;
  };
  sponsorships?: SponsorshipItem[];
  onNavigateTab: (tab: EventTabType) => void;
}

export function EventOverviewTab({
  event,
  health,
  financials,
  sponsorships = [],
  onNavigateTab,
}: EventOverviewTabProps) {
  const isOverBudget = financials.actualCost > financials.totalBudget;

  const milestones = [
    { label: 'Load In & Rigging', date: event.loadInDate, completed: true },
    { label: 'Technical Setup & FOH', date: event.setupDate, completed: true },
    { label: 'Technical Rehearsal (Dry Run)', date: event.technicalRehearsalDate, completed: false },
    { label: 'General Rehearsal (GR)', date: event.generalRehearsalDate, completed: false },
    { label: 'Show Day (Event Live)', date: event.eventDayDate || event.startDate, completed: false, highlight: true },
    { label: 'Load Out & Strike', date: event.loadOutDate, completed: false },
  ];

  return (
    <div className="space-y-6 pt-5">
      {/* Health Diagnostic Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          health.status === 'HEALTHY'
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            : health.status === 'WARNING'
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
            : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              health.status === 'HEALTHY'
                ? 'bg-emerald-500/20 text-emerald-400'
                : health.status === 'WARNING'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {health.status === 'HEALTHY' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Production Health Diagnosis: {health.status} ({health.score}/100)</span>
            </div>
            <div className="text-xs text-slate-300 mt-1 space-y-0.5">
              {health.reasons.length > 0 ? (
                health.reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span>&bull;</span>
                    <span>{r}</span>
                  </div>
                ))
              ) : (
                <div>All budget variance, artist rider approvals, risks, and stage cues are in optimal state.</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onNavigateTab(isOverBudget ? 'BUDGET' : 'RISKS')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition border border-slate-700"
          >
            {isOverBudget ? 'Resolve Budget Line' : 'Review Risks'}
          </button>
        </div>
      </div>

      {/* Financial Rollup Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Allocated Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Budget Cap</span>
            <Wallet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {formatCompactIDR(financials.totalBudget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Committed POs: {formatCompactIDR(financials.committedCost)}
          </div>
        </div>

        {/* Actual Spend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Actual Cost</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div
            className={`text-xl font-bold mt-2 font-mono ${
              isOverBudget ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {formatCompactIDR(financials.actualCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isOverBudget
              ? `Over budget by ${formatCompactIDR(financials.actualCost - financials.totalBudget)}`
              : `Remaining: ${formatCompactIDR(financials.remainingBudget)}`}
          </div>
        </div>

        {/* Actual Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Actual Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {formatCompactIDR(financials.actualRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target: {formatCompactIDR(financials.totalRevenue)}
          </div>
        </div>

        {/* Gross Profit & Margin */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Operating Profit</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {formatCompactIDR(financials.grossProfit)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            Margin: {financials.profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Production Milestones & Schedule Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Production Critical Path & Milestones</h2>
              <p className="text-xs text-slate-400">Key dates from load-in rig to show day and venue strike</p>
            </div>
            <button
              onClick={() => onNavigateTab('TIMELINE')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Kelola Timeline & Milestones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {milestones.map((m, i) => (
              <div key={i} className="relative flex items-center justify-between text-xs">
                <div
                  className={`absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    m.completed
                      ? 'bg-emerald-600 border-slate-950 text-white'
                      : m.highlight
                      ? 'bg-indigo-600 border-slate-950 text-white ring-4 ring-indigo-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {m.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                </div>
                <div>
                  <div className={`font-semibold ${m.highlight ? 'text-indigo-300 text-sm' : 'text-slate-200'}`}>
                    {m.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDate(m.date)}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    m.completed
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : m.highlight
                      ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {m.completed ? 'Done' : m.highlight ? 'Main Target' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project In-Charge (PIC) Roster */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Core Command Team (PICs)</h2>
            <p className="text-xs text-slate-400">Accountability matrix for event execution</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Project Manager</div>
              <div className="text-slate-100 font-semibold text-xs mt-0.5">{event.pics.projectManager}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Technical Director</div>
              <div className="text-slate-100 font-semibold text-xs mt-0.5">{event.pics.technicalPIC}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Production Lead</div>
              <div className="text-slate-100 font-semibold text-xs mt-0.5">{event.pics.productionPIC}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Finance & Settlement</div>
              <div className="text-slate-100 font-semibold text-xs mt-0.5">{event.pics.financePIC}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SPONSORSHIP & STRATEGIC PARTNERS OVERVIEW GRID */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Handshake className="w-4 h-4" />
              <span>SPONSORSHIP & COMMERCIAL PARTNERS OVERVIEW</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Portofolio Dukungan Sponsor & Kemitraan Strategis
            </h2>
            <p className="text-xs text-slate-400">
              Rekapitulasi sokongan dana tunai (Tiered Cash) dan fasilitas barter (In-Kind) untuk event ini.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('SPONSORSHIP')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold shrink-0"
          >
            <span>Kelola Sponsorship & Tambah Mitra</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight Summary Mini Metrics */}
        {(() => {
          const list = sponsorships || [];
          const cashList = list.filter((s) => s.type === 'CASH');
          const inKindList = list.filter((s) => s.type === 'IN_KIND');
          const totalCash = cashList.reduce((sum, s) => sum + (s.contributionValue || 0), 0);
          const totalInKind = inKindList.reduce((sum, s) => sum + (s.contributionValue || 0), 0);

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Dana Tunai Masuk (Cash)</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {formatIDR(totalCash)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {cashList.length} Entitas Sponsor Berjenjang
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Efisiensi Barter (In-Kind)</div>
                  <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
                    {formatIDR(totalInKind)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {inKindList.length} Mitra Strategis Fasilitas / Media
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Total Nilai Kemitraan</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {formatIDR(totalCash + totalInKind)}
                  </div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">
                    Akumulasi Kontribusi Event
                  </div>
                </div>
              </div>

              {/* Sponsor Grid Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {list.slice(0, 6).map((sp, idx) => {
                  const initial = (sp.brandName || sp.sponsorName || 'SP')
                    .replace(/^PT\.?\s+/i, '')
                    .trim()
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={`${sp.id || 'sp'}-${idx}`}
                      onClick={() => onNavigateTab('SPONSORSHIP')}
                      className="p-3 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800 rounded-xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {sp.logoUrl ? (
                            <img
                              src={sp.logoUrl}
                              alt={sp.brandName || sp.sponsorName}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xs font-bold text-indigo-400">
                              {initial}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition truncate">
                              {sp.brandName || sp.sponsorName}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 ${
                                sp.type === 'CASH'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {sp.type === 'CASH' ? 'Cash' : 'In-Kind'}
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-300/90 font-medium truncate mt-0.5">
                            {sp.tier}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-200">
                          {formatIDR(sp.contributionValue)}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-white transition flex items-center gap-0.5">
                          Detail <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('BUDGET')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-600 rounded-xl text-left transition group"
        >
          <div className="text-slate-400 group-hover:text-indigo-400 transition flex items-center justify-between">
            <Wallet className="w-4 h-4" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-2">Budget Variance</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Track overruns & costs</div>
        </button>

        <button
          onClick={() => onNavigateTab('TALENT')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-600 rounded-xl text-left transition group"
        >
          <div className="text-slate-400 group-hover:text-indigo-400 transition flex items-center justify-between">
            <Music className="w-4 h-4" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-2">Talent & Riders</div>
          <div className="text-[10px] text-slate-400 mt-0.5">FOH, backline, hospitality</div>
        </button>

        <button
          onClick={() => onNavigateTab('LOGISTICS_ERP')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-600 rounded-xl text-left transition group bg-gradient-to-br from-slate-900 to-indigo-950/30"
        >
          <div className="text-indigo-400 flex items-center justify-between">
            <Truck className="w-4 h-4" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div className="text-xs font-bold text-indigo-200 mt-2">ERP Logistics Hub</div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">mcaesarar2-boop bridge</div>
        </button>

        <button
          onClick={() => onNavigateTab('RUNDOWN')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-600 rounded-xl text-left transition group"
        >
          <div className="text-slate-400 group-hover:text-indigo-400 transition flex items-center justify-between">
            <Clock className="w-4 h-4" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-2">Master Rundown</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live cues for audio & lights</div>
        </button>
      </div>
    </div>
  );
}
