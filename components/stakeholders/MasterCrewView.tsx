'use client';

import React, { useState, useMemo } from 'react';
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
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Search,
  Calendar,
} from 'lucide-react';
import { CrewAssignment, Event, PaymentStatus } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface MasterCrewViewProps {
  crew: CrewAssignment[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateCrew?: (crew: Omit<CrewAssignment, 'id'>) => void;
  onUpdateCrew?: (id: string, crew: Partial<CrewAssignment>) => void;
  onDeleteCrew?: (id: string) => void;
}

const DEPARTMENTS = [
  'Production',
  'Audio & Sound',
  'Lighting & Visual',
  'Show Management',
  'Safety & Security',
  'Hospitality & Logistics',
];

const ROLES_BY_DEPARTMENT: Record<string, string[]> = {
  Production: ['Event Director', 'Project Manager', 'Production Manager', 'Technical Director', 'Runner'],
  'Audio & Sound': ['FOH Sound Engineer', 'Monitor Engineer', 'System Tech', 'Mic & Wireless Tech'],
  'Lighting & Visual': ['Lighting Director', 'Visual Jockey (VJ)', 'Laser Tech', 'LED Wall Tech'],
  'Show Management': ['Show Caller', 'Stage Manager', 'Assistant Stage Manager', 'Floor Director'],
  'Safety & Security': ['Head of Security', 'Crowd Controller', 'Medical Officer', 'Safety Inspector'],
  'Hospitality & Logistics': ['Liaison Officer (LO)', 'Artist Hospitality Head', 'Transport Coordinator'],
};

export function MasterCrewView({
  crew,
  events,
  onSelectEvent,
  onCreateCrew,
  onUpdateCrew,
  onDeleteCrew,
}: MasterCrewViewProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewAssignment | null>(null);
  const [deletingCrew, setDeletingCrew] = useState<CrewAssignment | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Production');
  const [role, setRole] = useState('Show Caller');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [phone, setPhone] = useState('');
  const [callTime, setCallTime] = useState('08:00 WIB');
  const [dailyRate, setDailyRate] = useState<number>(3000000);
  const [daysCount, setDaysCount] = useState<number>(1);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('SCHEDULED');
  const [notes, setNotes] = useState('');

  const departmentsFilterList = ['ALL', ...DEPARTMENTS];

  const resetForm = () => {
    setName('');
    setDepartment('Production');
    setRole('Show Caller');
    setEventId(events[0]?.id || '');
    setPhone('');
    setCallTime('08:00 WIB');
    setDailyRate(3000000);
    setDaysCount(1);
    setPaymentStatus('SCHEDULED');
    setNotes('');
    setEditingCrew(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (person: CrewAssignment) => {
    setEditingCrew(person);
    setName(person.name || '');
    const dept = person.department || 'Production';
    setDepartment(dept);
    setRole(person.role || (ROLES_BY_DEPARTMENT[dept] ? ROLES_BY_DEPARTMENT[dept][0] : 'Crew Staff'));
    setEventId(person.eventId || events[0]?.id || '');
    setPhone(person.phone || person.contact || '');
    setCallTime(person.callTime || '08:00 WIB');
    const rate = person.dailyRate || person.rate || 0;
    setDailyRate(rate);
    const count = person.daysCount || 1;
    setDaysCount(count);
    setPaymentStatus(person.paymentStatus || 'SCHEDULED');
    setNotes(person.notes || '');
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (person: CrewAssignment) => {
    setDeletingCrew(person);
  };

  const handleSaveCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama personil crew wajib diisi.');
      return;
    }

    const calculatedTotal = (Number(dailyRate) || 0) * (Number(daysCount) || 1);

    const payload = {
      name: name.trim(),
      role: role.trim(),
      department,
      eventId: eventId || events[0]?.id || 'evt-001',
      phone: phone.trim() || '+62 812-0000-0000',
      contact: phone.trim() || '+62 812-0000-0000',
      callTime: callTime.trim() || '08:00 WIB',
      dailyRate: Number(dailyRate) || 0,
      rate: Number(dailyRate) || 0,
      daysCount: Number(daysCount) || 1,
      totalFee: calculatedTotal,
      paymentStatus,
      notes: notes.trim(),
    };

    if (editingCrew) {
      if (onUpdateCrew) {
        onUpdateCrew(editingCrew.id, payload);
      }
    } else {
      if (onCreateCrew) {
        onCreateCrew(payload);
      }
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingCrew) return;
    if (onDeleteCrew) {
      onDeleteCrew(deletingCrew.id);
    }
    setDeletingCrew(null);
  };

  const filteredCrew = useMemo(() => {
    return crew.filter((c) => {
      const matchesDept = departmentFilter === 'ALL' || c.department === departmentFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q));
      return matchesDept && matchesSearch;
    });
  }, [crew, departmentFilter, searchQuery]);

  const totalCrewCost = crew.reduce((sum, c) => sum + (c.totalFee ?? c.rate ?? 0), 0);
  const totalCrewPaid = crew
    .filter((c) => c.paymentStatus === 'Paid' || c.paymentStatus === 'PAID')
    .reduce((sum, c) => sum + (c.totalFee ?? c.rate ?? 0), 0);

  const eventLinkedToDeleting = events.find((e) => e.id === deletingCrew?.eventId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            HUMAN CAPITAL & FIELD OPERATIONS
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crew Roster & Daily Rates</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manajemen penugasan staf lapangan (Show Caller, Sound/Lighting Eng, Stage Manager, LO, Security), call time, dan honorarium.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl hidden sm:inline-block">
            <span className="font-bold text-white">{crew.length}</span> Staf / Crew Terdata
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Crew / Staf</span>
          </button>
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
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama personil, posisi / role, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {departmentsFilterList.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                departmentFilter === dept
                  ? 'bg-indigo-600 text-white shadow'
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
          <table className="w-full text-left text-xs text-slate-300 min-w-[760px]">
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
                  <tr key={person.id} className="hover:bg-slate-800/40 transition group">
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
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {person.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(person)}
                          title="Edit Crew"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(person)}
                          title="Hapus Crew"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {ev && (
                          <button
                            onClick={() => onSelectEvent(ev.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium ml-1"
                          >
                            Workspace
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FORM CREATE / EDIT CREW */}
      {isFormModalOpen && (
        <div
          onClick={() => setIsFormModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden cursor-default my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingCrew ? 'Edit Penugasan Staf Crew' : 'Tambah Penugasan Crew Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingCrew
                      ? `Perbarui jadwal call time dan honorarium untuk ${editingCrew.name}`
                      : 'Lengkapi identitas staf lapangan, peran produksi, dan daily rate'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCrew} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Profil & Penugasan */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>1. Personil & Posisi Lapangan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Nama Lengkap Personil *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Hendra Setiawan / Citra Kirana Dewi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Departemen Produksi</label>
                    <select
                      value={department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        setDepartment(newDept);
                        if (ROLES_BY_DEPARTMENT[newDept]) {
                          setRole(ROLES_BY_DEPARTMENT[newDept][0]);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Posisi / Role Khusus</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Show Caller / Technical Director"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Event Penugasan</label>
                    <select
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} ({ev.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Operasional & Call Time */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2. Jadwal Call-Time & Kontak</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-8999-0011"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Call-Time Kedatangan Lapangan</label>
                    <input
                      type="text"
                      value={callTime}
                      onChange={(e) => setCallTime(e.target.value)}
                      placeholder="07:00 WIB"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Honorarium & Status */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>3. Daily Rate & Status Pembayaran</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Daily Rate (IDR)</label>
                    <input
                      type="number"
                      step="500000"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(dailyRate || 0)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Jumlah Hari Kerja</label>
                    <input
                      type="number"
                      min="1"
                      value={daysCount}
                      onChange={(e) => setDaysCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">Total: {formatIDR((dailyRate || 0) * (daysCount || 1))}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Status Pembayaran</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-slate-300">Catatan Khusus / Sertifikasi</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Sertifikasi K3 Scaffolding & Rigging, bertugas di FOH control tent."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCrew ? 'Simpan Perubahan Crew' : 'Tambah Crew ke Roster'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingCrew && (
        <div
          onClick={() => setDeletingCrew(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden cursor-default p-6 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Hapus Penugasan Staf Crew?</h3>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-rose-300">{deletingCrew.name}</span> ({deletingCrew.role}) dari daftar roster crew lapangan?
              </p>
            </div>

            {eventLinkedToDeleting && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3 rounded-xl text-left space-y-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Penugasan Event
                </div>
                <div className="text-[11px] text-slate-300">
                  Crew ini tercatat bertugas pada event <span className="font-semibold text-white">{eventLinkedToDeleting.name}</span> dengan call-time <span className="font-mono text-amber-300">{deletingCrew.callTime}</span>.
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCrew(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Hapus Crew
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
