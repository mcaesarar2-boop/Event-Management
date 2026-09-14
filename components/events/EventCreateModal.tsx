'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Users,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Truck,
  Wrench,
  Music,
  Tv,
  Check,
  Tag,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  Client,
  Venue,
  EventTemplate,
  EventType,
  EventPriority,
  EventStatus,
  UserAccount,
  ProductionMilestone,
} from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  venues: Venue[];
  templates: EventTemplate[];
  users?: UserAccount[];
  onCreateEvent: (data: any) => void;
}

type ModalTab = 'BASIC' | 'TIMELINE' | 'FINANCE' | 'TEAM';

const PRESET_TAGS = [
  'Outdoor Stadium',
  'Multi-Stage',
  'Live Concert',
  'Festival',
  'Live Streaming',
  'VIP Hospitality',
  'Brand Sponsorship',
  'Food & Beverages',
  'Hybrid Event',
  'Pyrotechnics & FX',
];

export function EventCreateModal({
  isOpen,
  onClose,
  clients,
  venues,
  templates,
  users = [],
  onCreateEvent,
}: EventCreateModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('BASIC');

  // Basic Info State
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('Concert');
  const [priority, setPriority] = useState<EventPriority>('HIGH');
  const [status, setStatus] = useState<EventStatus>('PRE_PRODUCTION');
  const [theme, setTheme] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [attendance, setAttendance] = useState(15000);
  const [tags, setTags] = useState<string[]>(['Live Concert', 'Multi-Stage']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Template State
  const [templateId, setTemplateId] = useState(templates[0]?.id || '');

  // Multi-day & Show Dates
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [showStartDate, setShowStartDate] = useState('2026-08-15');
  const [showEndDate, setShowEndDate] = useState('2026-08-16');

  // 7 Critical Timeline Phases (Production Schedule)
  const [loadInDate, setLoadInDate] = useState('2026-08-11');
  const [loadInTime, setLoadInTime] = useState('08:00');

  const [setupDate, setSetupDate] = useState('2026-08-12');
  const [setupTime, setSetupTime] = useState('09:00');

  const [techRehearsalDate, setTechRehearsalDate] = useState('2026-08-13');
  const [techRehearsalTime, setTechRehearsalTime] = useState('14:00');

  const [genRehearsalDate, setGenRehearsalDate] = useState('2026-08-14');
  const [genRehearsalTime, setGenRehearsalTime] = useState('19:00');

  const [showDayDate, setShowDayDate] = useState('2026-08-15');
  const [showGateTime, setShowGateTime] = useState('14:00');
  const [showCurfewTime, setShowCurfewTime] = useState('23:30');

  const [strikeDate, setStrikeDate] = useState('2026-08-17');
  const [strikeTime, setStrikeTime] = useState('00:00');

  const [loadOutDate, setLoadOutDate] = useState('2026-08-17');
  const [loadOutTime, setLoadOutTime] = useState('18:00');

  // Financial Targets
  const [budget, setBudget] = useState(1850000000);
  const [revenue, setRevenue] = useState(2750000000);

  // PIC Roster
  const [projectManager, setProjectManager] = useState('Dimas Arioseno');
  const [productionPIC, setProductionPIC] = useState('Hendra Setiawan');
  const [technicalPIC, setTechnicalPIC] = useState('Ir. Johanes Handoko');
  const [eventPIC, setEventPIC] = useState('Citra Kirana Dewi');
  const [financePIC, setFinancePIC] = useState('Ratna Ayu Larasati');
  const [creativePIC, setCreativePIC] = useState('Nadia Putri');
  const [safetyOfficer, setSafetyOfficer] = useState('Kapt. Bambang Sudiro');
  const [logisticsPIC, setLogisticsPIC] = useState('Eko Prasetyo');

  // Scope & Objectives
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');

  // Selected Venue & Client Helpers
  const selectedVenue = useMemo(() => venues.find((v) => v.id === venueId) || venues[0], [venues, venueId]);
  const selectedClient = useMemo(() => clients.find((c) => c.id === clientId) || clients[0], [clients, clientId]);
  const selectedTemplate = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId]);

  // Venue Capacity Calculation
  const occupancyRate = useMemo(() => {
    if (!selectedVenue || !selectedVenue.capacity) return 0;
    return Math.round((attendance / selectedVenue.capacity) * 100);
  }, [selectedVenue, attendance]);

  // Financial Metrics
  const projectedProfit = revenue - budget;
  const profitMargin = revenue > 0 ? ((projectedProfit / revenue) * 100).toFixed(1) : '0.0';
  const revPerPax = attendance > 0 ? Math.round(revenue / attendance) : 0;

  // Auto-calculate production dates based on Show Day
  const handleAutoCalculateDates = (baseDateStr: string) => {
    try {
      const base = new Date(baseDateStr);
      if (isNaN(base.getTime())) return;

      const fmt = (d: Date) => d.toISOString().split('T')[0];

      // D-4 Load In
      const dLoadIn = new Date(base.getTime() - 4 * 86400000);
      // D-3 Setup
      const dSetup = new Date(base.getTime() - 3 * 86400000);
      // D-2 Tech Rehearsal
      const dTech = new Date(base.getTime() - 2 * 86400000);
      // D-1 General Rehearsal (GR)
      const dGen = new Date(base.getTime() - 1 * 86400000);

      const targetEnd = isMultiDay ? new Date(showEndDate) : base;
      const endValid = !isNaN(targetEnd.getTime()) ? targetEnd : base;

      // D+1 Strike
      const dStrike = new Date(endValid.getTime() + 1 * 86400000);
      // D+2 Load Out
      const dLoadOut = new Date(endValid.getTime() + 2 * 86400000);

      setLoadInDate(fmt(dLoadIn));
      setSetupDate(fmt(dSetup));
      setTechRehearsalDate(fmt(dTech));
      setGenRehearsalDate(fmt(dGen));
      setShowDayDate(fmt(base));
      setStrikeDate(fmt(dStrike));
      setLoadOutDate(fmt(dLoadOut));
    } catch {
      // ignore date calculation errors
    }
  };

  const handleShowDateChange = (newDate: string) => {
    setShowStartDate(newDate);
    if (!isMultiDay) {
      setShowEndDate(newDate);
    }
    handleAutoCalculateDates(newDate);
  };

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const val = customTagInput.trim();
      if (!tags.includes(val)) {
        setTags([...tags, val]);
      }
      setCustomTagInput('');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActiveTab('BASIC');
      return;
    }

    const startDateTime = `${loadInDate}T${loadInTime}:00Z`;
    const endDateTime = `${loadOutDate}T${loadOutTime}:00Z`;
    const eventDayDateTime = `${showDayDate}T${showGateTime}:00Z`;

    onCreateEvent({
      name,
      type,
      priority,
      status,
      theme,
      objective,
      description,
      clientId,
      venueId,
      templateId: templateId || undefined,
      startDate: startDateTime,
      endDate: endDateTime,
      loadInDate: `${loadInDate}T${loadInTime}:00Z`,
      setupDate: `${setupDate}T${setupTime}:00Z`,
      technicalRehearsalDate: `${techRehearsalDate}T${techRehearsalTime}:00Z`,
      generalRehearsalDate: `${genRehearsalDate}T${genRehearsalTime}:00Z`,
      eventDayDate: eventDayDateTime,
      strikeDate: `${strikeDate}T${strikeTime}:00Z`,
      loadOutDate: `${loadOutDate}T${loadOutTime}:00Z`,
      expectedAttendance: Number(attendance),
      totalBudget: Number(budget),
      totalRevenue: Number(revenue),
      tags,
      pics: {
        projectManager,
        eventPIC,
        financePIC,
        productionPIC,
        technicalPIC,
        creativePIC,
        salesPIC: projectManager,
        safetyOfficer,
        logisticsPIC,
      },
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-4 sm:my-8 cursor-default flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Create New Production Event
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Production Master
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Inisialisasi data event lengkap: jadwal timeline 7 fase, alokasi anggaran, venue, dan tim PIC operasional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 flex gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('BASIC')}
            className={`py-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'BASIC'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Acara & Venue</span>
            {name.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'TIMELINE'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Timeline Produksi (7 Fase)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
              7 Tahap
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINANCE')}
            className={`py-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'FINANCE'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Finansial & Target</span>
            {budget > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEAM')}
            className={`py-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'TEAM'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>4. Tim PIC & Template</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: BASIC INFO & VENUE */}
          {activeTab === 'BASIC' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Event Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Nama / Judul Event *</span>
                    <span className="text-[11px] text-indigo-400">Wajib diisi</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Jakarta Summer Fest 2026 / Gadjah Mada Youth Fest"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Kategori / Tipe Event</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Concert">Concert</option>
                    <option value="Festival">Festival</option>
                    <option value="University Festival">University Festival</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Conference">Conference</option>
                    <option value="Brand Activation">Brand Activation</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Sports Event">Sports Event</option>
                    <option value="Government Event">Government Event</option>
                    <option value="Hybrid Event">Hybrid Event</option>
                  </select>
                </div>
              </div>

              {/* Priority, Initial Status & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Prioritas Produksi</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as EventPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH (Standard Major)</option>
                    <option value="CRITICAL">CRITICAL (Mega Production)</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Status Awal</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DRAFT">DRAFT (Konseptual)</option>
                    <option value="PROPOSAL">PROPOSAL</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PRE_PRODUCTION">PRE_PRODUCTION</option>
                    <option value="PRODUCTION">PRODUCTION (Aktif)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tema / Slogan Acara</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Contoh: Suara Nusantara Generasi Emas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Client and Venue Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Client Card */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      Klien / Promotor Organizer
                    </span>
                    <span className="text-[10px] text-slate-400">{clients.length} terdaftar</span>
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {clients.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.company} - PIC: {cli.contactPerson}
                      </option>
                    ))}
                  </select>
                  {selectedClient && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 space-y-0.5">
                      <div className="text-slate-300 font-medium">{selectedClient.company}</div>
                      <div>Kontak: {selectedClient.contactPerson} ({selectedClient.phone})</div>
                      <div className="text-[10px] text-slate-500 truncate">{selectedClient.industry} &middot; {selectedClient.address}</div>
                    </div>
                  )}
                </div>

                {/* Venue Card */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Lokasi & Venue
                    </span>
                    <span className="text-[10px] text-slate-400">{venues.length} venue</span>
                  </label>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {venues.map((ven) => (
                      <option key={ven.id} value={ven.id}>
                        {ven.name} ({ven.city} &middot; {ven.capacity.toLocaleString()} pax)
                      </option>
                    ))}
                  </select>
                  {selectedVenue && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{selectedVenue.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          {selectedVenue.type} &middot; Kapasitas {selectedVenue.capacity.toLocaleString()} Pax
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {selectedVenue.address}, {selectedVenue.city} | Curfew: {selectedVenue.curfewTime || '24:00 WIB'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance & Venue Occupancy */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Target Jumlah Penonton (Pax)
                  </label>
                  {selectedVenue && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        Kapasitas Venue: {selectedVenue.capacity.toLocaleString()} pax
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          occupancyRate > 100
                            ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                            : occupancyRate >= 80
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {occupancyRate}% Okupansi
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="number"
                    min="1"
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>
                      {occupancyRate > 100
                        ? '⚠️ Peringatan: Target melebihi batas kapasitas maksimum venue!'
                        : 'Okupansi aman untuk jalur evakuasi & flow penonton K3.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags Selection */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  Tag Karakteristik Event
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((t) => {
                    const isSelected = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleTag(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTION TIMELINE (7 PHASES) */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Show Day Header & Auto-Calculate Trigger */}
              <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/30 border border-indigo-900/50 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Penjadwalan 7 Tahapan Kritis Produksi (Critical Path)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pilih tanggal Hari-H (Show Day), sistem akan mengkalkulasi otomatis estimasi tanggal Load-In (D-4), Setup (D-3), GR (D-1), hingga Bongkaran (D+1).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAutoCalculateDates(showStartDate)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Auto-Kalkulasi D-Day</span>
                  </button>
                </div>

                {/* Show Day Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-900/30">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Hari-H (Show Day Utama) *
                    </label>
                    <input
                      type="date"
                      value={showStartDate}
                      onChange={(e) => handleShowDateChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Durasi Penyelenggaraan
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isMultiDay;
                          setIsMultiDay(next);
                          if (!next) setShowEndDate(showStartDate);
                        }}
                        className="text-[10px] text-indigo-400 hover:underline"
                      >
                        {isMultiDay ? 'Jadikan 1 Hari Saja' : '+ Multi-day (Beberapa Hari)'}
                      </button>
                    </div>
                    {isMultiDay ? (
                      <input
                        type="date"
                        value={showEndDate}
                        onChange={(e) => setShowEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-400">
                        Single Day (1 Hari Saja)
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Jam Open Gate & Curfew
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={showGateTime}
                        onChange={(e) => setShowGateTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="time"
                        value={showCurfewTime}
                        onChange={(e) => setShowCurfewTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Phase Pipeline Mini-Bar */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl overflow-x-auto">
                <div className="flex items-center justify-between min-w-[580px] text-[10px] font-semibold text-slate-400">
                  <div className="flex items-center gap-1 text-sky-400">
                    <Truck className="w-3.5 h-3.5" />
                    <span>1. Load-In (D-4)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>2. Setup (D-3)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1 text-amber-400">
                    <Music className="w-3.5 h-3.5" />
                    <span>3. Tech Dry Run (D-2)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1 text-violet-400">
                    <Tv className="w-3.5 h-3.5" />
                    <span>4. GR (D-1)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>5. SHOW DAY</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1 text-rose-400">
                    <span>6. Strike (D+1)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1 text-slate-300">
                    <span>7. Load-Out (D+2)</span>
                  </div>
                </div>
              </div>

              {/* 7 Detailed Phase Input Cards */}
              <div className="space-y-2.5">
                {/* 1. Load In */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-800 shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Load-In Logistik & Rigging Truss</div>
                      <div className="text-[10px] text-slate-400">Loading dock, genset PLN, konstruksi panggung</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={loadInDate}
                      onChange={(e) => setLoadInDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="time"
                      value={loadInTime}
                      onChange={(e) => setLoadInTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 2. Setup */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-800 shrink-0">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Audio, Lighting & LED Setup</div>
                      <div className="text-[10px] text-slate-400">FOH sound console, flying speaker, videotron LED</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={setupDate}
                      onChange={(e) => setSetupDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="time"
                      value={setupTime}
                      onChange={(e) => setSetupTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 3. Tech Rehearsal */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-800 shrink-0">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Technical Rehearsal & Soundcheck</div>
                      <div className="text-[10px] text-slate-400">Tuning delay tower, lighting cue, mic check</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={techRehearsalDate}
                      onChange={(e) => setTechRehearsalDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="time"
                      value={techRehearsalTime}
                      onChange={(e) => setTechRehearsalTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 4. General Rehearsal */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-950 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-800 shrink-0">
                      4
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">General Rehearsal (GR / Geladi Bersih)</div>
                      <div className="text-[10px] text-slate-400">Dry run rundown penuh MC, talent, dan stage manager</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={genRehearsalDate}
                      onChange={(e) => setGenRehearsalDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="time"
                      value={genRehearsalTime}
                      onChange={(e) => setGenRehearsalTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Show Day */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/60 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-700 shrink-0">
                      5
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-300">SHOW DAY (Hari-H Acara Live)</div>
                      <div className="text-[10px] text-emerald-400/80">Open gate, live performance, crowd control</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={showDayDate}
                      onChange={(e) => setShowDayDate(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-800/80 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-3 text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                    <span>Gate: {showGateTime}</span>
                    <span>-</span>
                    <span>Curfew: {showCurfewTime}</span>
                  </div>
                </div>

                {/* 6. Strike */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-800 shrink-0">
                      6
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Strike & Stage Dismantling (Bongkaran)</div>
                      <div className="text-[10px] text-slate-400">Penurunan rigging, bongkar sound, flight case</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={strikeDate}
                      onChange={(e) => setStrikeDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="time"
                      value={strikeTime}
                      onChange={(e) => setStrikeTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 7. Load Out */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700 shrink-0">
                      7
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Load-Out & Serah Terima Venue</div>
                      <div className="text-[10px] text-slate-400">Pengangkutan kontainer keluar & inspeksi venue</div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="date"
                      value={loadOutDate}
                      onChange={(e) => setLoadOutDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="time"
                      value={loadOutTime}
                      onChange={(e) => setLoadOutTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL TARGETS & BUDGET */}
          {activeTab === 'FINANCE' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                    Total Budget Allocation (OPEX)
                  </div>
                  <div className="text-base font-bold font-mono text-rose-400 mt-1">
                    {formatRupiah(budget)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Batas pagu pengeluaran seluruh divisi</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Target Gross Revenue
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {formatRupiah(revenue)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tiket, sponsor, booth, merchandise</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Estimasi Gross Margin</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        projectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {profitMargin}%
                    </span>
                  </div>
                  <div
                    className={`text-base font-bold font-mono mt-1 ${
                      projectedProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'
                    }`}
                  >
                    {projectedProfit >= 0 ? `+${formatRupiah(projectedProfit)}` : formatRupiah(projectedProfit)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Estimasi revenue/pax: {formatRupiah(revPerPax)}
                  </div>
                </div>
              </div>

              {/* Budget & Revenue Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget Input */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-rose-400" />
                    Alokasi Budget Produksi (IDR)
                  </label>
                  <input
                    type="number"
                    step="10000000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setBudget(500000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      500 Jt
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudget(1500000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      1.5 M
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudget(2850000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      2.85 M
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudget(5000000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      5.0 M
                    </button>
                  </div>
                </div>

                {/* Revenue Input */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Target Gross Revenue (IDR)
                  </label>
                  <input
                    type="number"
                    step="10000000"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setRevenue(750000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      750 Jt
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevenue(2200000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      2.2 M
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevenue(3750000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      3.75 M
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevenue(7000000000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      7.0 M
                    </button>
                  </div>
                </div>
              </div>

              {/* Standard Industry Cost Distribution Benchmark */}
              <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Rekomendasi Alokasi Pagu Biaya Produksi (Benchmark Industri Promotor)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Talent & Artis</div>
                    <div className="font-bold text-indigo-300 mt-0.5">~35%</div>
                    <div className="text-slate-500 font-mono mt-0.5">{formatRupiah(budget * 0.35)}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Stage & Audio/LED</div>
                    <div className="font-bold text-cyan-300 mt-0.5">~30%</div>
                    <div className="text-slate-500 font-mono mt-0.5">{formatRupiah(budget * 0.3)}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Venue & Perizinan</div>
                    <div className="font-bold text-emerald-300 mt-0.5">~15%</div>
                    <div className="text-slate-500 font-mono mt-0.5">{formatRupiah(budget * 0.15)}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Marketing & Promo</div>
                    <div className="font-bold text-amber-300 mt-0.5">~10%</div>
                    <div className="text-slate-500 font-mono mt-0.5">{formatRupiah(budget * 0.1)}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Operasional & Crew</div>
                    <div className="font-bold text-rose-300 mt-0.5">~10%</div>
                    <div className="text-slate-500 font-mono mt-0.5">{formatRupiah(budget * 0.1)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTION TEAM & TEMPLATE */}
          {activeTab === 'TEAM' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Template Selection Card */}
              <div className="bg-indigo-950/30 border border-indigo-900/50 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Terapkan Template Operasional (Auto-seeds Checklist, Rundown & Milestones)
                  </label>
                  {selectedTemplate && (
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {selectedTemplate.defaultMilestones.length} Milestones &middot; {selectedTemplate.defaultChecklist.length} Tasks
                    </span>
                  )}
                </div>

                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full bg-slate-950 border border-indigo-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="">Tanpa Template (Blank Slate)</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.eventType}) - {tpl.defaultMilestones.length} Milestones, {tpl.defaultChecklist.length} Tasks
                    </option>
                  ))}
                </select>

                {selectedTemplate && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-indigo-950 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-300 font-medium">{selectedTemplate.description}</span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Termasuk otomatisasi rundown (Open Gate, Act, Headliner, Closing) dan pembagian peran kru panggung.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Production Team PIC Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Struktur Person-in-Charge (PIC) Kunci Produksi
                  </label>
                  <span className="text-[10px] text-slate-500">Dapat dipilih atau diketik manual</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Project Manager / Show Dir</label>
                    <input
                      type="text"
                      value={projectManager}
                      onChange={(e) => setProjectManager(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Technical Director (AV Lead)</label>
                    <input
                      type="text"
                      value={technicalPIC}
                      onChange={(e) => setTechnicalPIC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Production Manager (Rigging)</label>
                    <input
                      type="text"
                      value={productionPIC}
                      onChange={(e) => setProductionPIC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Event Director (Operations)</label>
                    <input
                      type="text"
                      value={eventPIC}
                      onChange={(e) => setEventPIC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Finance & Commercial Lead</label>
                    <input
                      type="text"
                      value={financePIC}
                      onChange={(e) => setFinancePIC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Creative & Visual Director</label>
                    <input
                      type="text"
                      value={creativePIC}
                      onChange={(e) => setCreativePIC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Safety / K3 Crowd Officer</label>
                    <input
                      type="text"
                      value={safetyOfficer}
                      onChange={(e) => setSafetyOfficer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Logistics Coordinator</label>
                    <input
                      type="text"
                      value={logisticsPIC}
                      onChange={(e) => setLogisticsPIC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Objectives & Scope Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tujuan & Sasaran Utama Acara</label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Contoh: Memperingati Dies Natalis, meningkatkan eksposur brand, capaian kepuasan penonton 98%..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ruang Lingkup Produksi & Catatan Khusus</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Catatan panggung FOH, crowd control penonton, perizinan kepolisian, genset sinkron..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 sticky bottom-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
              >
                Batal
              </button>

              {activeTab !== 'BASIC' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'TIMELINE') setActiveTab('BASIC');
                    else if (activeTab === 'FINANCE') setActiveTab('TIMELINE');
                    else if (activeTab === 'TEAM') setActiveTab('FINANCE');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeTab !== 'TEAM' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'BASIC') {
                      if (!name.trim()) {
                        alert('Silakan isi Nama / Judul Event terlebih dahulu.');
                        return;
                      }
                      setActiveTab('TIMELINE');
                    } else if (activeTab === 'TIMELINE') {
                      setActiveTab('FINANCE');
                    } else if (activeTab === 'FINANCE') {
                      setActiveTab('TEAM');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <span>
                    {activeTab === 'BASIC'
                      ? 'Lanjut: Timeline Produksi →'
                      : activeTab === 'TIMELINE'
                      ? 'Lanjut: Finansial & Target →'
                      : 'Lanjut: Tim PIC & Template →'}
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Buat Event Produksi (Complete)</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
