'use client';

import React, { useState } from 'react';
import {
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Wallet,
  X,
} from 'lucide-react';
import { BudgetItem, BudgetCategory, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface EventBudgetTabProps {
  event: Event;
  budgetItems: BudgetItem[];
  onAddBudgetItem: (item: Omit<BudgetItem, 'id' | 'variance'>) => void;
  onUpdateBudgetItem: (id: string, data: Partial<BudgetItem>) => void;
  onDeleteBudgetItem: (id: string) => void;
}

export function EventBudgetTab({
  event,
  budgetItems,
  onAddBudgetItem,
  onUpdateBudgetItem,
  onDeleteBudgetItem,
}: EventBudgetTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<BudgetCategory>('Sound, Lighting & LED');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Paket');
  const [estimatedUnitCost, setEstimatedUnitCost] = useState(10000000);
  const [actualUnitCost, setActualUnitCost] = useState(10000000);
  const [notes, setNotes] = useState('');

  // Computations
  const totalEstimated = budgetItems.reduce((sum, b) => sum + b.estimatedTotal, 0);
  const totalActual = budgetItems.reduce((sum, b) => sum + b.actualTotal, 0);
  const totalVariance = totalEstimated - totalActual;
  const isOverallOverBudget = totalActual > event.totalBudget;

  const categories: BudgetCategory[] = [
    'Production & Staging',
    'Sound, Lighting & LED',
    'Talent & Artist Fee',
    'Venue & Permits',
    'Operations & Logistics',
    'Crew & Honorarium',
    'Marketing & Media',
    'Hospitality & Catering',
    'Contingency & Misc',
  ];

  const filteredItems = selectedCategory === 'ALL'
    ? budgetItems
    : budgetItems.filter((b) => b.category === selectedCategory);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onAddBudgetItem({
      eventId: event.id,
      category,
      description,
      vendorName: vendorName || 'Direct Vendor',
      quantity: Number(quantity),
      unit,
      estimatedUnitCost: Number(estimatedUnitCost),
      estimatedTotal: Number(quantity) * Number(estimatedUnitCost),
      actualUnitCost: Number(actualUnitCost),
      actualTotal: Number(quantity) * Number(actualUnitCost),
      status: 'Approved',
      notes,
    });

    setIsModalOpen(false);
    setDescription('');
    setVendorName('');
    setQuantity(1);
    setEstimatedUnitCost(10000000);
    setActualUnitCost(10000000);
    setNotes('');
  };

  const exportCSV = () => {
    const headers = ['Category', 'Description', 'Vendor', 'Qty', 'Unit', 'Est Unit Cost', 'Est Total', 'Actual Unit Cost', 'Actual Total', 'Variance', 'Status', 'Notes'];
    const rows = budgetItems.map((b) => [
      `"${b.category}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      `"${b.vendorName || ''}"`,
      b.quantity,
      `"${b.unit}"`,
      b.estimatedUnitCost,
      b.estimatedTotal,
      b.actualUnitCost,
      b.actualTotal,
      b.variance,
      `"${b.status}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Budget_${event.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Banner & Warnings */}
      {isOverallOverBudget && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-center justify-between text-rose-300">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-100">Critical: Actual Cost Exceeds Allocated Budget Cap</div>
              <div className="text-xs text-rose-300/90 mt-0.5">
                Total actual cost is Rp {totalActual.toLocaleString('id-ID')}, surpassing the budget cap of Rp {event.totalBudget.toLocaleString('id-ID')} by Rp {(totalActual - event.totalBudget).toLocaleString('id-ID')}.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-rose-900 border border-rose-700 rounded text-rose-200">
            OVER BUDGET
          </span>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Budget Cap</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCompactIDR(event.totalBudget)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Agreed client budget ceiling</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Estimated Total</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCompactIDR(totalEstimated)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Based on planning line estimates</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Actual Realized Cost</div>
          <div className={`text-xl font-bold mt-1 font-mono ${isOverallOverBudget ? 'text-rose-400' : 'text-slate-100'}`}>
            {formatCompactIDR(totalActual)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sum of real contracted POs & bills</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Net Variance (Est - Act)</div>
          <div className={`text-xl font-bold mt-1 font-mono ${totalVariance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalVariance < 0 ? '-' : '+'}{formatCompactIDR(Math.abs(totalVariance))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalVariance < 0 ? 'Cost Overrun in sub-categories' : 'Cost Savings achieved'}
          </div>
        </div>
      </div>

      {/* Control Bar: Filter by Category & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories ({budgetItems.length})
          </button>
          {categories.map((cat) => {
            const count = budgetItems.filter((b) => b.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            id="btn-add-budget-line"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Budget Line</span>
          </button>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category & Description</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Qty / Unit</th>
                <th className="py-3 px-4">Est. Total</th>
                <th className="py-3 px-4">Actual Total</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const isItemOver = item.variance < 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item.description}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                      {item.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{item.notes}</div>}
                    </td>

                    <td className="py-3 px-4 text-slate-300">{item.vendorName || '-'}</td>

                    <td className="py-3 px-4 text-slate-300">
                      {item.quantity} {item.unit}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatIDR(item.estimatedTotal)}
                    </td>

                    <td className={`py-3 px-4 font-mono font-medium ${isItemOver ? 'text-rose-400' : 'text-slate-200'}`}>
                      {formatIDR(item.actualTotal)}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isItemOver
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {item.variance < 0 ? '-' : '+'}
                        {formatCompactIDR(Math.abs(item.variance))}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteBudgetItem(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Budget Line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Line Item Modal */}
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
              <h3 className="text-sm font-bold text-slate-100">Add Budget Line Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BudgetCategory)}
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
                <label className="text-xs font-semibold text-slate-300">Item Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. FOH Console Digico SD7 Rental"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Assigned Vendor / Contractor</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Sumber Audio Visual (SAV)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Unit / Day / Set"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Estimated Unit Cost (IDR)</label>
                  <input
                    type="number"
                    step="100000"
                    value={estimatedUnitCost}
                    onChange={(e) => setEstimatedUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Actual Unit Cost (IDR)</label>
                  <input
                    type="number"
                    step="100000"
                    value={actualUnitCost}
                    onChange={(e) => setActualUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Notes / Scope details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, delivery include operator, etc."
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
                  Save Budget Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
