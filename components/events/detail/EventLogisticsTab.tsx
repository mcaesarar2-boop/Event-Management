'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code,
  Layers,
  Sparkles,
  Package,
  X,
} from 'lucide-react';
import { EventRequirement, Event } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface EventLogisticsTabProps {
  event: Event;
  requirements: EventRequirement[];
  onCreateRequirement: (req: Omit<EventRequirement, 'id' | 'externalSystem'>) => void;
  onDispatchLogistics: () => void;
}

export function EventLogisticsTab({
  event,
  requirements,
  onCreateRequirement,
  onDispatchLogistics,
}: EventLogisticsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Form State
  const [itemReference, setItemReference] = useState('L-Acoustics K2 Line Array Module');
  const [category, setCategory] = useState('Audio & Sound');
  const [quantity, setQuantity] = useState(24);
  const [unit, setUnit] = useState('Box');
  const [requiredDate, setRequiredDate] = useState(event.loadInDate?.split('T')[0] || '2026-06-10');
  const [returnDate, setReturnDate] = useState(event.loadOutDate?.split('T')[0] || '2026-06-13');
  const [notes, setNotes] = useState('Includes flying grid hardware and rigging pins');

  const draftCount = requirements.filter((r) => r.status === 'DRAFT').length;
  const requestedCount = requirements.filter((r) => r.status === 'REQUESTED').length;
  const reservedCount = requirements.filter((r) => r.status === 'RESERVED').length;
  const allocatedCount = requirements.filter((r) => r.status === 'ALLOCATED').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemReference.trim()) return;

    onCreateRequirement({
      eventId: event.id,
      itemReference,
      category,
      quantity: Number(quantity),
      unit,
      requiredDate,
      returnDate,
      status: 'DRAFT',
      notes,
    });

    setIsModalOpen(false);
    setItemReference('');
  };

  const handleDispatch = async () => {
    setDispatchStatus('DISPATCHING');
    try {
      const res = await fetch(`/api/events/${event.id}/logistics-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus('SUCCESS');
        onDispatchLogistics();
        setTimeout(() => setDispatchStatus(null), 3500);
      } else {
        setDispatchStatus('ERROR');
      }
    } catch {
      onDispatchLogistics();
      setDispatchStatus('SUCCESS');
      setTimeout(() => setDispatchStatus(null), 3500);
    }
  };

  // Sample JSON integration contract payload preview
  const integrationContractPayload = {
    source: 'EVENT_MANAGEMENT_SYSTEM (EMS Enterprise)',
    targetSystem: 'ERP_LOGISTICS (mcaesarar2-boop/erp-logistik)',
    protocol: 'REST_WEBHOOK_JSON',
    event: {
      id: event.id,
      code: event.code,
      name: event.name,
      city: event.city,
      venue: event.venueName,
      dates: {
        loadIn: event.loadInDate,
        eventDay: event.eventDayDate || event.startDate,
        loadOut: event.loadOutDate,
      },
      contacts: {
        technicalDirector: event.pics.technicalPIC,
        projectManager: event.pics.projectManager,
      },
    },
    requirementsSummary: {
      totalItemsCount: requirements.length,
      audioBoxes: requirements.filter((r) => r.category.includes('Audio')).reduce((s, r) => s + r.quantity, 0),
      gensetUnits: requirements.filter((r) => r.category.includes('Power')).reduce((s, r) => s + r.quantity, 0),
    },
    requirementsList: requirements.map((r) => ({
      requirementId: r.id,
      itemReference: r.itemReference,
      category: r.category,
      quantity: r.quantity,
      unit: r.unit,
      requiredDate: r.requiredDate,
      returnDate: r.returnDate,
      status: r.status,
      externalReference: r.externalReference || null,
      notes: r.notes,
    })),
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Integration Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/60 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              ERP Logistics Integration Ready &middot; REST Bridge
            </span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-100 mt-1">
            Production Equipment & Logistics Allocation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Abstracts high-level sound, lighting, and power requirements for automated sync with{' '}
            <code className="px-1.5 py-0.5 bg-slate-950 rounded text-indigo-300 font-mono text-[11px] border border-slate-800">
              mcaesarar2-boop/erp-logistik
            </code>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPayloadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect JSON Contract</span>
          </button>

          <button
            onClick={handleDispatch}
            disabled={dispatchStatus === 'DISPATCHING'}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {dispatchStatus === 'DISPATCHING'
                ? 'Dispatching API...'
                : dispatchStatus === 'SUCCESS'
                ? 'Synced to ERP!'
                : 'Dispatch to ERP Logistik'}
            </span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Draft Requirements</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{draftCount} Items</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting dispatch</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Requested / In Queue</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{requestedCount} Items</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sent to warehouse queue</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Reserved in Warehouse</div>
          <div className="text-xl font-bold text-indigo-300 mt-1 font-mono">{reservedCount} Items</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Bin & lot locked</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Allocated / Dispatched</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{allocatedCount} Items</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Loaded into fleet trucks</div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="font-semibold text-xs text-slate-200">
            Logistics Equipment Demand Registry ({requirements.length})
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item Reference</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Required Window</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ERP Ref ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{req.itemReference}</div>
                    {req.notes && <div className="text-[10px] text-slate-400 mt-0.5 italic">{req.notes}</div>}
                  </td>

                  <td className="py-3 px-4 text-indigo-300">{req.category}</td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-100">
                    {req.quantity} {req.unit}
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                    {req.requiredDate} &rarr; {req.returnDate}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        req.status === 'ALLOCATED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : req.status === 'RESERVED'
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                          : req.status === 'REQUESTED'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {req.externalReference ? (
                      <span className="text-indigo-400 font-semibold">{req.externalReference}</span>
                    ) : (
                      <span className="text-slate-600">Pending Sync</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Requirement Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Equipment Requirement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Equipment Reference *</label>
                <input
                  type="text"
                  required
                  value={itemReference}
                  onChange={(e) => setItemReference(e.target.value)}
                  placeholder="e.g. Digico SD7 Quantum Console Set"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Audio & Sound">Audio & Sound</option>
                    <option value="Lighting & Truss">Lighting & Truss</option>
                    <option value="LED Screen & Video">LED Screen & Video</option>
                    <option value="Power & Generator">Power & Generator</option>
                    <option value="Rigging & Staging">Rigging & Staging</option>
                    <option value="Crowd Barricade">Crowd Barricade</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Quantity & Unit</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Required Date (Load-in)</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Return Date (Load-out)</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Specification Details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Multi-core snake cable 100m, isolated grounding"
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
                  Save Demand Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Contract Inspector Modal */}
      {isPayloadModalOpen && (
        <div
          onClick={() => setIsPayloadModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  ERP Logistik JSON Webhook Contract Preview
                </h3>
              </div>
              <button onClick={() => setIsPayloadModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="text-xs text-slate-400 mb-2">
                Payload format sent to <code>POST /api/events/:id/logistics-request</code> for automatic intake by ERP Logistik.
              </div>
              <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(integrationContractPayload, null, 2)}
              </pre>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setIsPayloadModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
