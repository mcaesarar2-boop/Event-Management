'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  Building,
  ShoppingBag,
  X,
} from 'lucide-react';
import { RevenueItem, Event, RevenueCategory } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface EventRevenueTabProps {
  event: Event;
  revenues: RevenueItem[];
  onCreateRevenue: (rev: Omit<RevenueItem, 'id' | 'outstanding'>) => void;
}

export function EventRevenueTab({
  event,
  revenues,
  onCreateRevenue,
}: EventRevenueTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<RevenueCategory>('Sponsorship');
  const [description, setDescription] = useState('');
  const [targetRevenue, setTargetRevenue] = useState(250000000);
  const [actualRevenue, setActualRevenue] = useState(250000000);
  const [received, setReceived] = useState(125000000);
  const [status, setStatus] = useState<RevenueItem['status']>('Partial');

  const totalTarget = revenues.reduce((sum, r) => sum + (r.targetRevenue ?? r.estimatedRevenue ?? 0), 0);
  const totalActual = revenues.reduce((sum, r) => sum + r.actualRevenue, 0);
  const totalReceived = revenues.reduce((sum, r) => sum + r.received, 0);
  const totalOutstanding = revenues.reduce((sum, r) => sum + r.outstanding, 0);

  const categories: RevenueCategory[] = [
    'Sponsorship',
    'Ticket Sales',
    'Tenant & Booth Rental',
    'Merchandise Sales',
    'Broadcasting Rights',
    'F&B Share',
    'Government Subsidy',
    'Other Revenue',
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onCreateRevenue({
      eventId: event.id,
      category,
      description,
      targetRevenue: Number(targetRevenue),
      actualRevenue: Number(actualRevenue),
      received: Number(received),
      status,
      notes: 'Added via revenue manager',
    });

    setIsModalOpen(false);
    setDescription('');
    setTargetRevenue(250000000);
    setActualRevenue(250000000);
    setReceived(125000000);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Revenue Streams & Commercial Cashflow
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sponsorship packages, tiered ticket box office, booth rentals, and collection tracking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Revenue Stream</span>
        </button>
      </div>

      {/* Financial Rollup Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Target Revenue</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCompactIDR(totalTarget)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Budgeted top-line target</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Realized / Contracted</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{formatCompactIDR(totalActual)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {((totalActual / (totalTarget || 1)) * 100).toFixed(0)}% of target achieved
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Collected Cash in Bank</div>
          <div className="text-xl font-bold text-indigo-300 mt-1 font-mono">{formatCompactIDR(totalReceived)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Actual incoming bank transfer</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Outstanding Receivable</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{formatCompactIDR(totalOutstanding)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sponsor invoices awaiting payment</div>
        </div>
      </div>

      {/* Revenue Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 font-semibold text-xs text-slate-200">
          Commercial Revenue Items ({revenues.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category & Stream</th>
                <th className="py-3 px-4">Target (IDR)</th>
                <th className="py-3 px-4">Realized Contract</th>
                <th className="py-3 px-4">Received Cash</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {revenues.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{rev.description}</div>
                    <div className="text-[10px] text-indigo-400">{rev.category}</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">{formatIDR(rev.targetRevenue)}</td>

                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {formatIDR(rev.actualRevenue)}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-200">{formatIDR(rev.received)}</td>

                  <td className="py-3 px-4 font-mono text-amber-400">
                    {rev.outstanding > 0 ? formatIDR(rev.outstanding) : 'Rp 0 (Lunas)'}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        rev.status === 'Paid in Full'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : rev.status === 'Partial'
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Revenue Modal */}
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
              <h3 className="text-sm font-bold text-slate-100">Add Revenue Stream</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Revenue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RevenueCategory)}
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
                <label className="text-xs font-semibold text-slate-300">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Bank Mandiri Main Sponsor Title"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Target Amount (IDR)</label>
                  <input
                    type="number"
                    step="5000000"
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Realized Contract (IDR)</label>
                  <input
                    type="number"
                    step="5000000"
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Received to Date (IDR)</label>
                  <input
                    type="number"
                    step="5000000"
                    value={received}
                    onChange={(e) => setReceived(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Payment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RevenueItem['status'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Invoiced">Invoiced</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid in Full">Paid in Full</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
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
                  Save Revenue Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
