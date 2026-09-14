'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Clock,
  Briefcase,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Filter,
  Shield,
  Layers,
} from 'lucide-react';
import { CrewAssignment, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface MasterCrewViewProps {
  crew: CrewAssignment[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateCrew?: (crew: Omit<CrewAssignment, 'id'>) => void;
}

export function MasterCrewView({
  crew,
  events,
  onSelectEvent,
}: MasterCrewViewProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = ['ALL', 'Production', 'Audio & Sound', 'Lighting & Visual', 'Show Management', 'Safety & Security', 'Hospitality & Logistics'];

  const filteredCrew = crew.filter((c) => {
    const matchesDept = departmentFilter === 'ALL' || c.department === departmentFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    return matchesDept && matchesSearch;
  });

  const totalCrewCost = crew.reduce((sum, c) => sum + (c.totalFee ?? c.rate ?? 0), 0);
  const totalCrewPaid = crew
    .filter((c) => c.paymentStatus === 'Paid' || c.paymentStatus === 'PAID')
    .reduce((sum, c) => sum + (c.totalFee ?? c.rate ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            HUMAN CAPITAL & FIELD OPERATIONS
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crew Roster & Daily Rates</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manajemen penugasan staf lapangan (Show Caller, Sound/Lighting Eng, Stage Manager, LO, Security), call time, dan honorarium.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            {crew.length} Staf / Crew Terdata
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Staf & Operator Lapangan</div>
          <div className="text-2xl font-bold text-white font-mono">{crew.length} Personil</div>
          <div className="text-xs text-indigo-400 mt-1">Terbagi di 6 Departemen Produksi</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Komitmen Honorarium</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{formatIDR(totalCrewCost)}</div>
          <div className="text-xs text-slate-400 mt-1">Estimasi Daily Rate x Hari Kerja</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Honorarium Sudah Dibayarkan</div>
          <div className="text-2xl font-bold text-sky-400 font-mono">{formatIDR(totalCrewPaid)}</div>
          <div className="text-xs text-slate-400 mt-1">
            Sisa Belum Dibayar: {formatCompactIDR(totalCrewCost - totalCrewPaid)}
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama personil, posisi / role, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                departmentFilter === dept
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {dept === 'ALL' ? 'Semua Departemen' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Crew Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Daftar Personil & Jadwal Call-Time</h2>
            <p className="text-xs text-slate-400 mt-0.5">Penugasan spesifik personil ke masing-masing event produksi.</p>
          </div>
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Nama Personil</th>
                <th className="py-3.5 px-4 font-semibold">Role & Divisi</th>
                <th className="py-3.5 px-4 font-semibold">Event Penugasan</th>
                <th className="py-3.5 px-4 font-semibold">Call Time & Kontak</th>
                <th className="py-3.5 px-4 font-semibold text-right">Daily Rate (IDR)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Honor (IDR)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status Pembayaran</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCrew.map((person) => {
                const ev = events.find((e) => e.id === person.eventId);
                const isPaid = person.paymentStatus === 'Paid' || person.paymentStatus === 'PAID';

                return (
                  <tr key={person.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{person.name}</div>
                      <div className="text-[11px] text-slate-400">{person.department || 'Production Team'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-medium text-[11px]">
                        {person.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {ev?.name || 'All Events'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-amber-300 font-mono text-xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {person.callTime || '08:00 WIB'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{person.phone || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {formatIDR(person.dailyRate || person.rate || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatIDR(person.totalFee || person.rate || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {person.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {ev ? (
                        <button
                          onClick={() => onSelectEvent(ev.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                        >
                          Workspace
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
