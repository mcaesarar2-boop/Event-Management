'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Clock,
  Phone,
  DollarSign,
  CheckCircle2,
  Briefcase,
  X,
} from 'lucide-react';
import { CrewAssignment, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface EventCrewTabProps {
  event: Event;
  crew: CrewAssignment[];
  onCreateCrew: (crew: Omit<CrewAssignment, 'id'>) => void;
}

export function EventCrewTab({
  event,
  crew,
  onCreateCrew,
}: EventCrewTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Stage Manager');
  const [department, setDepartment] = useState('Production');
  const [phone, setPhone] = useState('0812-3456-7890');
  const [callTime, setCallTime] = useState('08:00 WIB');
  const [dailyRate, setDailyRate] = useState(2500000);
  const [daysCount, setDaysCount] = useState(3);
  const [paymentStatus, setPaymentStatus] = useState<CrewAssignment['paymentStatus']>('Pending');

  const totalCrewCost = crew.reduce((sum, c) => sum + (c.totalFee ?? c.rate ?? 0), 0);
  const totalPaid = crew.filter((c) => c.paymentStatus === 'Paid' || c.paymentStatus === 'PAID').reduce((sum, c) => sum + (c.totalFee ?? c.rate ?? 0), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const totalFee = Number(dailyRate) * Number(daysCount);

    onCreateCrew({
      eventId: event.id,
      name,
      role,
      department,
      phone,
      callTime,
      dailyRate: Number(dailyRate),
      daysCount: Number(daysCount),
      totalFee,
      paymentStatus,
    });

    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Crew Roster, Call Times & Honorarium
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage managers, FOH audio engineers, lighting directors, LOs, and security coordinators
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Crew Member</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Headcount</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{crew.length} Crew</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active assigned personnel</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Honorarium</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCompactIDR(totalCrewCost)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Estimated payroll obligation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Disbursed / Paid</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{formatCompactIDR(totalPaid)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Processed through bank transfer</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Outstanding Payable</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{formatCompactIDR(totalCrewCost - totalPaid)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scheduled upon event wrap-up</div>
        </div>
      </div>

      {/* Crew Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name & Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Call Time</th>
                <th className="py-3 px-4">Rate & Days</th>
                <th className="py-3 px-4">Total Fee</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {crew.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{c.name}</div>
                    <div className="text-[11px] text-indigo-400 font-medium">{c.role}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">{c.department}</td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {c.callTime}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    {formatIDR(c.dailyRate || c.rate || 0)} &times; {c.daysCount || 1} hari
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-100">
                    {formatIDR(c.totalFee ?? c.rate ?? 0)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        c.paymentStatus === 'Paid'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : c.paymentStatus === 'Pending'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {c.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Crew Modal */}
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
              <h3 className="text-sm font-bold text-slate-100">Assign Crew Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bagus Pratama"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Production Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Stage Manager"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Audio / Sound">Audio / Sound</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Visual / Multimedia">Visual / Multimedia</option>
                    <option value="Stage Management">Stage Management</option>
                    <option value="Liaison Officer (LO)">Liaison Officer (LO)</option>
                    <option value="Security & Crowd Control">Security & Crowd Control</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Daily Rate (IDR)</label>
                  <input
                    type="number"
                    step="250000"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Call Time</label>
                  <input
                    type="text"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
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
                  Save Crew Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
