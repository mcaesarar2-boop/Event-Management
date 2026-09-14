'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  Flame,
  CloudRain,
  Zap,
  Users,
} from 'lucide-react';
import { RiskItem, Event } from '@/lib/types';

interface EventRisksTabProps {
  event: Event;
  risks: RiskItem[];
  onCreateRisk: (risk: Omit<RiskItem, 'id' | 'score'>) => void;
  onUpdateRiskStatus: (id: string, status: RiskItem['status']) => void;
}

export function EventRisksTab({
  event,
  risks,
  onCreateRisk,
  onUpdateRiskStatus,
}: EventRisksTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<RiskItem['category']>('Crowd Safety');
  const [description, setDescription] = useState('');
  const [probability, setProbability] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [impact, setImpact] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [mitigation, setMitigation] = useState('');
  const [contingency, setContingency] = useState('');
  const [owner, setOwner] = useState(event.pics.safetyOfficer || 'Safety Lead');

  const categories: Array<RiskItem['category']> = [
    'Crowd Safety',
    'Weather & Force Majeure',
    'Permits & Regulatory',
    'Power & Technical',
    'Talent & Artist',
    'Financial & Commercial',
    'Medical & Health',
    'Security & Conflict',
  ];

  const criticalRisks = risks.filter((r) => ((r.score ?? r.severity ?? 0) >= 15));
  const mediumRisks = risks.filter((r) => ((r.score ?? r.severity ?? 0) >= 7 && (r.score ?? r.severity ?? 0) < 15));
  const lowRisks = risks.filter((r) => ((r.score ?? r.severity ?? 0) < 7));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const prob = Number(probability) as 1 | 2 | 3 | 4 | 5;
    const imp = Number(impact) as 1 | 2 | 3 | 4 | 5;
    const calcScore = prob * imp;

    onCreateRisk({
      eventId: event.id,
      category,
      description,
      probability: prob,
      impact: imp,
      severity: calcScore,
      mitigation: mitigation || 'Standby team ready with standard SOP',
      contingency: contingency || 'Escalate to Event Director and Incident Command',
      owner,
      status: 'Identified',
    });

    setIsModalOpen(false);
    setDescription('');
    setMitigation('');
    setContingency('');
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Risk Register & Incident Preparedness (5x5 Matrix)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate probability & impact, emergency crowd crush prevention, weather contingencies, and electrical redundancy
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Risk</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Risks Identified</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{risks.length} Items</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all production domains</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Critical / High Severity</div>
          <div className="text-xl font-bold text-rose-400 mt-1 font-mono">{criticalRisks.length} Risks</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Score 15-25 (Requires daily review)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Moderate Severity</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{mediumRisks.length} Risks</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Score 7-14 (SOP mitigation active)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Low / Acceptable</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{lowRisks.length} Risks</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Score 1-6 (Routine monitoring)</div>
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Risk & Domain</th>
                <th className="py-3 px-3 text-center">Prob (1-5)</th>
                <th className="py-3 px-3 text-center">Impact (1-5)</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-4">Mitigation SOP</th>
                <th className="py-3 px-4">Contingency Plan</th>
                <th className="py-3 px-3">PIC Owner</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {risks.map((r) => {
                const scoreValue = r.score ?? r.severity ?? (r.probability * r.impact);
                const isCritical = scoreValue >= 15;
                const isMedium = scoreValue >= 7 && scoreValue < 15;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{r.description}</div>
                      <div className="text-[10px] text-indigo-400 font-medium">{r.category}</div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                      {r.probability}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                      {r.impact}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : isMedium
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {scoreValue}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-xs">{r.mitigation}</td>

                    <td className="py-3 px-4 text-slate-400 max-w-xs">{r.contingency}</td>

                    <td className="py-3 px-3 font-medium text-slate-200">{r.owner}</td>

                    <td className="py-3 px-3">
                      <select
                        value={r.status}
                        onChange={(e) => onUpdateRiskStatus(r.id, e.target.value as RiskItem['status'])}
                        className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Identified">Identified</option>
                        <option value="Mitigating">Mitigating</option>
                        <option value="Closed">Closed</option>
                        <option value="Occurred">Occurred</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Risk Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Register Operational Risk</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Risk Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RiskItem['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Risk Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Hujan lebat disertai angin kencang merobohkan tenda FOH"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Probability (1 = Rare, 5 = Almost Certain)</label>
                  <select
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value={1}>1 - Rare (&lt; 10%)</option>
                    <option value={2}>2 - Unlikely (10-30%)</option>
                    <option value={3}>3 - Possible (30-60%)</option>
                    <option value={4}>4 - Likely (60-80%)</option>
                    <option value={5}>5 - Almost Certain (&gt; 80%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Impact (1 = Negligible, 5 = Catastrophic)</label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value={1}>1 - Insignificant</option>
                    <option value={2}>2 - Minor</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Major</option>
                    <option value={5}>5 - Catastrophic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Mitigation Strategy (Preventive Action)</label>
                <input
                  type="text"
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  placeholder="e.g. Anchor rigging dengan counterweight beton 5 ton & pasang terpal waterproof"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Contingency Plan (If Incident Happens)</label>
                <input
                  type="text"
                  value={contingency}
                  onChange={(e) => setContingency(e.target.value)}
                  placeholder="e.g. Evakuasi sound console ke under-stage booth dan pause show 30 menit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">PIC Owner</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Save Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
