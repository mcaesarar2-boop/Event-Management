'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  MapPin,
  Sparkles,
  User,
  Trash2,
  X,
  Sliders,
  Check,
} from 'lucide-react';
import { Event, ProductionMilestone } from '@/lib/types';
import { formatDate, calculateDaysUntil } from '@/lib/utils/format';
import { EventTabType } from './EventDetailHeader';

interface EventTimelineTabProps {
  event: Event;
  onUpdateEvent: (id: string, data: Partial<Event>) => void;
  onNavigateTab: (tab: EventTabType) => void;
  onNavigateView?: (view: any) => void;
}

interface CorePhaseItem {
  key: string;
  field: keyof Event;
  name: string;
  category: 'LOAD_IN' | 'SETUP' | 'REHEARSAL' | 'SHOW_DAY' | 'STRIKE' | 'LOAD_OUT';
  dateStr: string;
  defaultTime: string;
  defaultPic: string;
  description: string;
}

export function EventTimelineTab({
  event,
  onUpdateEvent,
  onNavigateTab,
  onNavigateView,
}: EventTimelineTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);

  // Edit core dates form state
  const [editLoadIn, setEditLoadIn] = useState(event.loadInDate ? event.loadInDate.split('T')[0] : '');
  const [editSetup, setEditSetup] = useState(event.setupDate ? event.setupDate.split('T')[0] : '');
  const [editTechReh, setEditTechReh] = useState(event.technicalRehearsalDate ? event.technicalRehearsalDate.split('T')[0] : '');
  const [editGenReh, setEditGenReh] = useState(event.generalRehearsalDate ? event.generalRehearsalDate.split('T')[0] : '');
  const [editShowDay, setEditShowDay] = useState(event.eventDayDate ? event.eventDayDate.split('T')[0] : event.startDate.split('T')[0]);
  const [editStrike, setEditStrike] = useState(event.strikeDate ? event.strikeDate.split('T')[0] : '');
  const [editLoadOut, setEditLoadOut] = useState(event.loadOutDate ? event.loadOutDate.split('T')[0] : '');

  // Add custom milestone form state
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState(event.startDate.split('T')[0]);
  const [customTime, setCustomTime] = useState('10:00');
  const [customPic, setCustomPic] = useState(event.pics?.projectManager || 'Project Manager');
  const [customCategory, setCustomCategory] = useState<ProductionMilestone['category']>('CUSTOM');
  const [customNotes, setCustomNotes] = useState('');

  // Core production phases definition
  const corePhases: CorePhaseItem[] = [
    {
      key: 'loadin',
      field: 'loadInDate',
      name: 'Load-In Logistik, Genset & Rigging Truss',
      category: 'LOAD_IN',
      dateStr: event.loadInDate || '',
      defaultTime: '08:00 WIB',
      defaultPic: event.pics?.productionPIC || 'Production Manager',
      description: 'Akses loading dock, instalasi generator PLN/Genset, dan pemasangan struktur rigging panggung utama.',
    },
    {
      key: 'setup',
      field: 'setupDate',
      name: 'Stage, Audio & Lighting System Setup',
      category: 'SETUP',
      dateStr: event.setupDate || '',
      defaultTime: '09:00 WIB',
      defaultPic: event.pics?.technicalPIC || 'Technical Director',
      description: 'Pemasangan FOH sound system, lighting fixtures, LED screen videotron, dan instalasi jalur kabel daya.',
    },
    {
      key: 'techreh',
      field: 'technicalRehearsalDate',
      name: 'Technical Rehearsal (Dry Run) & Soundcheck',
      category: 'REHEARSAL',
      dateStr: event.technicalRehearsalDate || '',
      defaultTime: '14:00 WIB',
      defaultPic: event.pics?.technicalPIC || 'FOH Audio Engineer',
      description: 'Pengujian sinyal audio multitrack, tuning delay tower speaker, fokus lighting cue, dan tes sinyal LED screen.',
    },
    {
      key: 'genreh',
      field: 'generalRehearsalDate',
      name: 'General Rehearsal (GR) / Geladi Bersih',
      category: 'REHEARSAL',
      dateStr: event.generalRehearsalDate || '',
      defaultTime: '19:00 WIB',
      defaultPic: event.pics?.projectManager || 'Show Director',
      description: 'Simulasi rundown penuh dari pembukaan hingga penutup bersama pengisi acara, MC, dan seluruh operator panggung.',
    },
    {
      key: 'showday',
      field: 'eventDayDate',
      name: 'SHOW DAY (Event Live / Hari-H)',
      category: 'SHOW_DAY',
      dateStr: event.eventDayDate || event.startDate || '',
      defaultTime: '14:00 - 23:30 WIB',
      defaultPic: event.pics?.eventPIC || 'Event Director',
      description: 'Penyelenggaraan acara live, open gate, penampilan artis & talent, pengelolaan penonton, hingga show finale.',
    },
    {
      key: 'strike',
      field: 'strikeDate',
      name: 'Strike & Stage Dismantling (Bongkaran)',
      category: 'STRIKE',
      dateStr: event.strikeDate || '',
      defaultTime: '00:00 WIB',
      defaultPic: event.pics?.productionPIC || 'Stage Manager',
      description: 'Bongkaran sound system, penurunan rigging truss, pelepasan LED modul, dan pengemasan flightcase alat.',
    },
    {
      key: 'loadout',
      field: 'loadOutDate',
      name: 'Load-Out, Pembersihan & Serah Terima Venue',
      category: 'LOAD_OUT',
      dateStr: event.loadOutDate || '',
      defaultTime: '18:00 WIB',
      defaultPic: event.pics?.projectManager || 'Project Manager',
      description: 'Pengangkutan logistik keluar venue via kontainer truk, inspeksi kebersihan lapangan, dan serah terima pengelola venue.',
    },
  ];

  // Helper to determine status based on date
  const getPhaseStatus = (dateStr: string) => {
    if (!dateStr) return { label: 'Belum Diatur', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    const today = new Date().toISOString().split('T')[0];
    const target = dateStr.split('T')[0];
    if (target < today) return { label: 'Selesai (Completed)', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
    if (target === today) return { label: 'Hari Ini (In Progress)', color: 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse' };
    return { label: 'Terjadwal (Scheduled)', color: 'bg-indigo-950 text-indigo-400 border-indigo-800' };
  };

  const daysUntilShow = calculateDaysUntil(event.eventDayDate || event.startDate);

  // Save edited core dates
  const handleSaveCoreDates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent(event.id, {
      loadInDate: editLoadIn ? `${editLoadIn}T08:00:00Z` : event.loadInDate,
      setupDate: editSetup ? `${editSetup}T09:00:00Z` : event.setupDate,
      technicalRehearsalDate: editTechReh ? `${editTechReh}T14:00:00Z` : event.technicalRehearsalDate,
      generalRehearsalDate: editGenReh ? `${editGenReh}T19:00:00Z` : event.generalRehearsalDate,
      eventDayDate: editShowDay ? `${editShowDay}T14:00:00Z` : event.eventDayDate,
      strikeDate: editStrike ? `${editStrike}T00:00:00Z` : event.strikeDate,
      loadOutDate: editLoadOut ? `${editLoadOut}T18:00:00Z` : event.loadOutDate,
    });
    setIsEditModalOpen(false);
  };

  // Add custom milestone
  const handleAddCustomMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newMilestone: ProductionMilestone = {
      id: `ms-${Date.now()}`,
      name: customName,
      category: customCategory,
      date: customDate,
      time: customTime,
      status: 'SCHEDULED',
      pic: customPic,
      notes: customNotes,
    };

    const updatedList = [...(event.customMilestones || []), newMilestone];
    onUpdateEvent(event.id, { customMilestones: updatedList });

    setCustomName('');
    setCustomNotes('');
    setIsAddCustomModalOpen(false);
  };

  // Delete custom milestone
  const handleDeleteCustomMilestone = (id: string) => {
    const updatedList = (event.customMilestones || []).filter((m) => m.id !== id);
    onUpdateEvent(event.id, { customMilestones: updatedList });
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Banner & Quick Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Operational Timeline & Production Critical Path
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">
            Jadwal Tahapan Produksi: {event.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Atur dan monitor seluruh tahapan mulai dari Load-In logistik, Setup FOH & Rigging, Rehearsal,
            Show Day, hingga Bongkaran (Strike). Perubahan tanggal di sini otomatis tersinkronisasi ke Master Calendar.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateView && (
            <button
              onClick={() => onNavigateView('CALENDAR')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Buka di Master Calendar ↗</span>
            </button>
          )}

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Tanggal Timeline</span>
          </button>

          <button
            onClick={() => setIsAddCustomModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Milestone Custom</span>
          </button>
        </div>
      </div>

      {/* Target Countdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Menuju Show Day</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {daysUntilShow.label}
          </div>
          <div className="text-[11px] text-indigo-400 font-medium mt-0.5">
            {formatDate(event.eventDayDate || event.startDate)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Load-In Dimulai</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {calculateDaysUntil(event.loadInDate).label}
          </div>
          <div className="text-[11px] text-sky-400 font-medium mt-0.5">
            {event.loadInDate ? formatDate(event.loadInDate) : 'Belum diatur'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Venue Acara</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 mt-2 truncate">
            {event.venueName || 'Belum dipilih'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {event.city}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Rundown D-Day</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </div>
          <button
            onClick={() => onNavigateTab('RUNDOWN')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-2.5 flex items-center gap-1 hover:underline"
          >
            <span>Buka Master Rundown &rarr;</span>
          </button>
          <div className="text-[10px] text-slate-500 mt-1">Multi-day Cue Sheet</div>
        </div>
      </div>

      {/* Production Critical Path Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Fase Utama Produksi & Milestone Operasional</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Urutan kronologis alur kerja lapangan dari loading, gladi resik, hari pertunjukan, hingga bongkaran.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {corePhases.length + (event.customMilestones?.length || 0)} Tahapan
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {corePhases.map((phase) => {
            const statusInfo = getPhaseStatus(phase.dateStr);
            const isShowDay = phase.category === 'SHOW_DAY';

            return (
              <div
                key={phase.key}
                className={`relative p-3.5 rounded-xl border transition group ${
                  isShowDay
                    ? 'bg-rose-950/20 border-rose-800/60 hover:bg-rose-950/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                {/* Node circle on the vertical timeline */}
                <div
                  className={`absolute -left-6 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isShowDay
                      ? 'bg-rose-600 border-slate-950 text-white ring-4 ring-rose-500/20'
                      : statusInfo.label.includes('Completed')
                      ? 'bg-emerald-600 border-slate-950 text-white'
                      : 'bg-indigo-600 border-slate-950 text-white'
                  }`}
                >
                  {statusInfo.label.includes('Completed') ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isShowDay ? 'text-rose-300' : 'text-slate-200'
                        }`}
                      >
                        {phase.name}
                      </span>
                      {isShowDay && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-semibold border border-rose-700">
                          Main Target
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right flex-shrink-0">
                    <div>
                      <div className="text-xs font-semibold text-slate-200 font-mono">
                        {phase.dateStr ? formatDate(phase.dateStr) : 'Tanggal belum diatur'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 sm:justify-end mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{phase.defaultTime}</span>
                        <span>&bull;</span>
                        <User className="w-3 h-3" />
                        <span>{phase.defaultPic}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Render Custom Milestones if Any */}
          {event.customMilestones && event.customMilestones.length > 0 && (
            <div className="pt-2 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Milestone & Tahapan Tambahan (Kustom)</span>
              </div>

              {event.customMilestones.map((ms) => (
                <div
                  key={ms.id}
                  className="relative p-3.5 rounded-xl border bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 transition flex items-center justify-between gap-3"
                >
                  <div
                    className="absolute -left-6 top-4 w-4 h-4 rounded-full border-2 bg-indigo-600 border-slate-950 text-white flex items-center justify-center"
                  >
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200">{ms.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ms.notes || 'Milestone operasional tambahan'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-200">{formatDate(ms.date)}</div>
                      <div className="text-[10px] text-slate-400">{ms.time || '10:00 WIB'} &bull; {ms.pic || 'PIC'}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteCustomMilestone(ms.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Hapus milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT CORE DATES MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-400" />
                  <span>Edit Tanggal Timeline Produksi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ubah tanggal setiap fase. Perubahan akan langsung disinkronkan ke Master Calendar dan sistem logistik.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoreDates} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">1. Tanggal Load-In & Rigging</label>
                  <input
                    type="date"
                    value={editLoadIn}
                    onChange={(e) => setEditLoadIn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">2. Tanggal Setup Stage & FOH</label>
                  <input
                    type="date"
                    value={editSetup}
                    onChange={(e) => setEditSetup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">3. Technical Rehearsal (Dry Run)</label>
                  <input
                    type="date"
                    value={editTechReh}
                    onChange={(e) => setEditTechReh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">4. General Rehearsal (GR / Geladi)</label>
                  <input
                    type="date"
                    value={editGenReh}
                    onChange={(e) => setEditGenReh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-rose-300 font-bold mb-1">5. SHOW DAY (D-Day / Live Acara)</label>
                  <input
                    type="date"
                    value={editShowDay}
                    onChange={(e) => setEditShowDay(e.target.value)}
                    className="w-full bg-rose-950/30 border border-rose-800/80 rounded-lg px-3 py-2 text-rose-200 focus:outline-none focus:border-rose-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">6. Tanggal Strike (Bongkaran)</label>
                  <input
                    type="date"
                    value={editStrike}
                    onChange={(e) => setEditStrike(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">7. Tanggal Load-Out & Handover Venue</label>
                <input
                  type="date"
                  value={editLoadOut}
                  onChange={(e) => setEditLoadOut(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM MILESTONE MODAL */}
      {isAddCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Tambah Milestone Kustom</span>
              </h3>
              <button
                onClick={() => setIsAddCustomModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Milestone</label>
                <input
                  type="text"
                  placeholder="Contoh: Press Conference Media / Inspeksi Gegana"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Waktu</label>
                  <input
                    type="text"
                    placeholder="10:00 WIB"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Penanggung Jawab (PIC)</label>
                <input
                  type="text"
                  value={customPic}
                  onChange={(e) => setCustomPic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Instruksi khusus atau dependensi..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition"
                >
                  Tambahkan Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

