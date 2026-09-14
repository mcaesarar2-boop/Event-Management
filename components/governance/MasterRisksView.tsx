'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  CloudRain,
  Zap,
  Users,
  CheckCircle2,
  HelpCircle,
  Plus,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { RiskItem, Event } from '@/lib/types';

interface MasterRisksViewProps {
  risks: RiskItem[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateRisk?: (risk: Omit<RiskItem, 'id' | 'severity'>) => void;
  onUpdateRiskStatus?: (id: string, status: RiskItem['status']) => void;
}

export function MasterRisksView({
  risks,
  events,
  onSelectEvent,
  onCreateRisk,
  onUpdateRiskStatus,
}: MasterRisksViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(risks[0] || null);

  const categories = [
    'ALL',
    'Crowd Safety',
    'Weather & Force Majeure',
    'Permits & Regulatory',
    'Power & Technical',
    'Talent & Artist',
    'Financial & Commercial',
    'Medical & Health',
    'Security & Conflict',
  ];

  const filteredRisks = risks.filter((r) => {
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesSearch =
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mitigation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const criticalRisks = risks.filter((r) => ((r.score ?? r.severity ?? 0) >= 15));
  const mediumRisks = risks.filter((r) => ((r.score ?? r.severity ?? 0) >= 7 && (r.score ?? r.severity ?? 0) < 15));
  const lowRisks = risks.filter((r) => ((r.score ?? r.severity ?? 0) < 7));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            GOVERNANCE, SAFETY & AUDIT
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Risk Register & Contingency Matrix</h1>
          <p className="text-sm text-slate-400 mt-1">
            Matriks risiko 5x5: Crowd Safety, Cuaca/Hujan Badai, Kegagalan Listrik Genset, Keterlambatan Izin Keramaian, dan Rencana Kontinjensi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800/40 px-3 py-1.5 rounded-lg font-semibold">
            {criticalRisks.length} Risiko Kritis Teridentifikasi
          </span>
        </div>
      </div>

      {/* KPI Severity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-rose-800/50 p-5 rounded-xl">
          <div className="text-rose-400 text-xs font-semibold uppercase mb-1">CRITICAL RISK (Skor 15 - 25)</div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{criticalRisks.length} Bahaya</div>
          <div className="text-xs text-slate-400 mt-1">Wajib SOP & Contingency Tertulis</div>
        </div>
        <div className="bg-slate-900 border border-amber-800/50 p-5 rounded-xl">
          <div className="text-amber-400 text-xs font-semibold uppercase mb-1">MEDIUM RISK (Skor 7 - 14)</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{mediumRisks.length} Isu</div>
          <div className="text-xs text-slate-400 mt-1">Monitoring & Mitigasi Aktif</div>
        </div>
        <div className="bg-slate-900 border border-emerald-800/50 p-5 rounded-xl">
          <div className="text-emerald-400 text-xs font-semibold uppercase mb-1">LOW RISK (Skor 1 - 6)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{lowRisks.length} Terkendali</div>
          <div className="text-xs text-slate-400 mt-1">SOP Operasional Standar</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1">STATUS MITIGASI SELESAI</div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {risks.filter((r) => r.status === 'Mitigated' || r.status === 'Closed').length} / {risks.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Closed / Mitigated Actions</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Cari deskripsi risiko, PIC, atau mitigasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Log Matriks Risiko Lintas Portofolio Event</h2>
            <p className="text-xs text-slate-400 mt-0.5">Penilaian Probabilitas x Dampak (Severity 1-25) & Action Plan.</p>
          </div>
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs text-slate-300 min-w-[850px]">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Deskripsi Bahaya / Risiko</th>
                <th className="py-3.5 px-4 font-semibold">Kategori</th>
                <th className="py-3.5 px-4 font-semibold">Event</th>
                <th className="py-3.5 px-4 font-semibold text-center">P x I</th>
                <th className="py-3.5 px-4 font-semibold text-center">Skor Tingkat Bahaya</th>
                <th className="py-3.5 px-4 font-semibold">Rencana Mitigasi & Kontinjensi</th>
                <th className="py-3.5 px-4 font-semibold">PIC Owner</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRisks.map((risk) => {
                const ev = events.find((e) => e.id === risk.eventId);
                const score = risk.score ?? risk.severity ?? (risk.probability * risk.impact);
                const isCrit = score >= 15;
                const isMed = score >= 7 && score < 15;

                return (
                  <tr key={risk.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white text-sm">{risk.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium text-[11px]">
                        {risk.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {ev?.name || 'All Events'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {risk.probability} x {risk.impact}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : isMed
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {score} - {isCrit ? 'CRITICAL' : isMed ? 'MEDIUM' : 'LOW'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="text-slate-300">{risk.mitigation}</div>
                      {risk.contingency && (
                        <div className="text-[11px] text-amber-300 mt-1 font-mono">
                          Kontinjensi: {risk.contingency}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {risk.owner}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        risk.status === 'Mitigated' || risk.status === 'Closed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {ev ? (
                        <button
                          onClick={() => onSelectEvent(ev.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                        >
                          Event
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
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
