'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  Package,
  Layers,
  Sparkles,
  Volume2,
  Sun,
  Video,
  Zap,
  Music,
  Grid,
  List,
  Printer,
  Search,
  Filter,
  Trash2,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Edit2,
  X,
} from 'lucide-react';
import { EventRequirement, Event, Artist, RequirementStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';
import { InventoryItemPickerModal } from './InventoryItemPickerModal';

interface EventLogisticsTabProps {
  event: Event;
  requirements: EventRequirement[];
  artists?: Artist[];
  onCreateRequirement: (req: Omit<EventRequirement, 'id' | 'externalSystem'>) => void;
  onUpdateRequirement?: (id: string, data: Partial<EventRequirement>) => void;
  onDeleteRequirement?: (id: string) => void;
  onDispatchLogistics?: () => void;
}

// Major Category Groups
interface CategoryGroup {
  id: string;
  name: string;
  icon: any;
  color: string;
  match: (cat: string, name?: string) => boolean;
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'SOUND',
    name: 'Audio & Sound / PA System',
    icon: Volume2,
    color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60',
    match: (c) => c.toUpperCase().includes('SOUND') || c.toUpperCase().includes('AUDIO'),
  },
  {
    id: 'LIGHTING',
    name: 'Stage Lighting & SFX',
    icon: Sun,
    color: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    match: (c) => c.toUpperCase().includes('LIGHT'),
  },
  {
    id: 'LED_VIDEO',
    name: 'Visual & LED Screen',
    icon: Video,
    color: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
    match: (c) => c.toUpperCase().includes('LED') || c.toUpperCase().includes('VIDEO') || c.toUpperCase().includes('VISUAL'),
  },
  {
    id: 'POWER_GENSET',
    name: 'Power & Genset Distro',
    icon: Zap,
    color: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60',
    match: (c) => c.toUpperCase().includes('POWER') || c.toUpperCase().includes('GENSET'),
  },
  {
    id: 'STAGE_RIGGING',
    name: 'Stage, Rigging & Truss',
    icon: Layers,
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    match: (c) => c.toUpperCase().includes('STAGE') || c.toUpperCase().includes('RIGGING') || c.toUpperCase().includes('TRUSS'),
  },
  {
    id: 'BACKLINE',
    name: 'Backline & Musical Instruments',
    icon: Music,
    color: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    match: (c) => c.toUpperCase().includes('BACKLINE') || c.toUpperCase().includes('INSTRUMENT'),
  },
];

export function EventLogisticsTab({
  event,
  requirements,
  artists = [],
  onCreateRequirement,
  onUpdateRequirement,
  onDeleteRequirement,
}: EventLogisticsTabProps) {
  // Modal & Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerInitialSearch, setPickerInitialSearch] = useState('');

  // View switch: Grid vs List
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search & Filter within allocated items
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Interactive checklist tracking for artist rider items
  // Key format: `${artistId}_${itemIndex}`
  const [fulfilledRiders, setFulfilledRiders] = useState<Record<string, boolean>>(() => {
    // Pre-populate some as fulfilled based on existing requirements
    const initial: Record<string, boolean> = {};
    artists.forEach((art, aIdx) => {
      const riderList = [
        ...(art.technicalRider?.backlineList || []),
        ...(art.technicalRider?.microphoneSpec || []),
      ];
      riderList.forEach((rText, rIdx) => {
        const key = `${art.id || aIdx}_${rIdx}`;
        // If requirements has an item matching part of this rider text, mark fulfilled
        const isMatched = requirements.some(
          (req) =>
            req.itemReference.toLowerCase().includes(rText.toLowerCase().slice(0, 8)) ||
            rText.toLowerCase().includes(req.itemReference.toLowerCase().slice(0, 8))
        );
        if (isMatched) {
          initial[key] = true;
        }
      });
    });
    return initial;
  });

  // Selected artist for rider section tabs
  const [activeArtistIndex, setActiveArtistIndex] = useState(0);
  const currentArtist = artists[activeArtistIndex] || artists[0];

  // Flat list of all artist rider items for global KPI calculation
  const allArtistRiderItems = useMemo(() => {
    const list: Array<{ key: string; artistName: string; itemText: string }> = [];
    artists.forEach((art, aIdx) => {
      const riderItems = [
        ...(art.technicalRider?.backlineList || []),
        ...(art.technicalRider?.microphoneSpec || []),
      ];
      riderItems.forEach((itemText, rIdx) => {
        list.push({
          key: `${art.id || aIdx}_${rIdx}`,
          artistName: art.name,
          itemText,
        });
      });
    });
    return list;
  }, [artists]);

  const totalRidersCount = allArtistRiderItems.length;
  const fulfilledRidersCount = allArtistRiderItems.filter((r) => fulfilledRiders[r.key]).length;

  // KPIs Calculations
  const totalSKUs = requirements.length;
  const totalUnitsReady = requirements
    .filter((r) => r.status === 'ALLOCATED' || r.status === 'RESERVED' || r.status === 'DELIVERED')
    .reduce((sum, r) => sum + r.quantity, 0);

  const totalUnitsNeeded = requirements.reduce((sum, r) => sum + r.quantity, 0);

  const readinessPercent = useMemo(() => {
    if (requirements.length === 0) return 0;
    const readyItemsCount = requirements.filter(
      (r) => r.status === 'ALLOCATED' || r.status === 'RESERVED' || r.status === 'DELIVERED'
    ).length;
    return Math.round((readyItemsCount / requirements.length) * 100);
  }, [requirements]);

  // Toggle rider fulfillment
  const toggleRiderFulfillment = (key: string) => {
    setFulfilledRiders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Open Supabase Item Picker with prefilled search from artist rider
  const handleQuickAllocateFromRider = (riderText: string, keyToFulfill?: string) => {
    // Extract clean search term (e.g. "Ampeg SVT-CL" -> "Ampeg")
    const words = riderText.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/);
    const searchKeyword = words.slice(0, 2).join(' ') || riderText;
    setPickerInitialSearch(searchKeyword);
    setIsPickerOpen(true);

    if (keyToFulfill) {
      setFulfilledRiders((prev) => ({ ...prev, [keyToFulfill]: true }));
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: RequirementStatus) => {
    switch (status) {
      case 'ALLOCATED':
      case 'DELIVERED':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80';
      case 'RESERVED':
        return 'bg-indigo-950/70 text-indigo-400 border-indigo-800/80';
      case 'REQUESTED':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/80';
      case 'RETURNED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-800';
    }
  };

  // Cycle status handler
  const handleCycleStatus = (req: EventRequirement) => {
    if (!onUpdateRequirement) return;
    const statuses: RequirementStatus[] = ['DRAFT', 'REQUESTED', 'RESERVED', 'ALLOCATED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(req.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onUpdateRequirement(req.id, { status: nextStatus });
  };

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      // 1. Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.itemReference.toLowerCase().includes(q) ||
        (req.sku && req.sku.toLowerCase().includes(q)) ||
        (req.placementArea && req.placementArea.toLowerCase().includes(q)) ||
        (req.notes && req.notes.toLowerCase().includes(q)) ||
        req.category.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Category filter
      if (selectedCategoryFilter !== 'ALL') {
        const group = CATEGORY_GROUPS.find((g) => g.id === selectedCategoryFilter);
        if (group && !group.match(req.category, req.itemReference)) {
          return false;
        }
      }

      // 3. Status filter
      if (selectedStatusFilter !== 'ALL' && req.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [requirements, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  // Group filtered requirements by major category
  const groupedRequirements = useMemo(() => {
    const groups: Array<{ group: CategoryGroup; items: EventRequirement[] }> = [];

    CATEGORY_GROUPS.forEach((cg) => {
      const items = filteredRequirements.filter((r) => cg.match(r.category, r.itemReference));
      if (items.length > 0 || (selectedCategoryFilter === cg.id && filteredRequirements.length > 0)) {
        groups.push({ group: cg, items });
      }
    });

    // Catch any uncategorized items
    const uncategorizedItems = filteredRequirements.filter(
      (r) => !CATEGORY_GROUPS.some((cg) => cg.match(r.category, r.itemReference))
    );

    if (uncategorizedItems.length > 0) {
      groups.push({
        group: {
          id: 'OTHER',
          name: 'Peralatan Pendukung / Lainnya',
          icon: Package,
          color: 'text-slate-400 bg-slate-900 border-slate-800',
          match: () => true,
        },
        items: uncategorizedItems,
      });
    }

    return groups;
  }, [filteredRequirements, selectedCategoryFilter]);

  return (
    <div className="space-y-6 pt-3">
      {/* 1. Header Operasional Bersih */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              {readinessPercent >= 80 ? 'Logistik Ready & Siap Angkut' : 'Alokasi Panggung Berjalan'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1.5 flex items-center gap-2">
            Alokasi Logistik & Peralatan Event
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Sistem terpadu inventaris panggung, FOH, lighting, dan genset yang terhubung langsung dengan katalog peralatan Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Readiness Pill */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400">Kesiapan: </span>
              <span className="font-bold font-mono text-emerald-400">{readinessPercent}%</span>
            </div>
          </div>

          {/* Primary Action Button: + Alokasikan Alat dari Gudang */}
          <button
            onClick={() => {
              setPickerInitialSearch('');
              setIsPickerOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Alokasikan Alat dari Gudang</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Ringkasan di Bagian Atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total SKU */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total SKU Dialokasikan</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 font-mono">
            {totalSKUs} <span className="text-xs font-normal text-slate-400">SKU</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-indigo-400 font-semibold">{groupedRequirements.length}</span> kategori panggung
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Total Unit Siap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Unit Barang Siap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2 font-mono">
            {totalUnitsReady}{' '}
            <span className="text-xs font-normal text-slate-400">/ {totalUnitsNeeded} unit</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Alat siap angkut & bin-locked
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Riders Artis Terpenuhi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Riders Artis Terpenuhi</span>
            <Music className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-300 mt-2 font-mono">
            {fulfilledRidersCount}{' '}
            <span className="text-xs font-normal text-slate-400">/ {totalRidersCount} Terpenuhi</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${totalRidersCount > 0 ? (fulfilledRidersCount / totalRidersCount) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Status Load-in Readiness */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Load-in Readiness</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-2 font-mono">
            {readinessPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {readinessPercent >= 90
              ? 'Peralatan siap kirim ke venue'
              : readinessPercent >= 50
              ? 'Menunggu alokasi beberapa unit'
              : 'Perlu verifikasi alokasi alat'}
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 3. Section Khusus: Technical Riders & Backline Artis */}
      {artists.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Technical Riders & Kebutuhan Artis</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  {artists.length} Artis Terdaftar
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Checklist kelengkapan backline, sound console, dan mikrofon spesifik yang diminta oleh artis penampil.
              </p>
            </div>

            {/* Artist Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {artists.map((art, idx) => (
                <button
                  key={art.id || idx}
                  onClick={() => setActiveArtistIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    activeArtistIndex === idx
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {art.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Artist Card & Checklist */}
          {currentArtist && (
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-4">
              {/* Artist Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300 font-bold text-sm">
                    {currentArtist.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{currentArtist.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {currentArtist.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/50 text-purple-400 border border-purple-900/50">
                        {currentArtist.genre}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Agency: {currentArtist.agency} &middot; PIC: {currentArtist.contactPerson || '-'}
                    </div>
                  </div>
                </div>

                {currentArtist.technicalRider?.audioRequirement && (
                  <div className="text-right text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Audio Spec FOH:</span>
                    <span className="text-indigo-300 font-medium text-[11px] line-clamp-1">
                      {currentArtist.technicalRider.audioRequirement}
                    </span>
                  </div>
                )}
              </div>

              {/* Rider Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Backline Items */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Backline & Instrument Rider:</span>
                    <span className="text-[10px] text-slate-500">
                      {currentArtist.technicalRider?.backlineList?.length || 0} item
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(currentArtist.technicalRider?.backlineList || [
                      'Ampeg SVT-CL Bass Head + 810E Cab',
                      'Fender Twin Reverb 65 Reissue',
                      'Yamaha Absolute Hybrid Maple Drum Set',
                    ]).map((itemText: string, rIdx: number) => {
                      const key = `${currentArtist.id || activeArtistIndex}_${rIdx}`;
                      const isFulfilled = Boolean(fulfilledRiders[key]);

                      return (
                        <div
                          key={rIdx}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                            isFulfilled
                              ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                              : 'bg-slate-900/90 border-slate-800 text-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => toggleRiderFulfillment(key)}
                            className="flex items-center space-x-2.5 text-left min-w-0 flex-1 group"
                          >
                            {isFulfilled ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
                            )}
                            <span
                              className={`text-xs ${
                                isFulfilled ? 'line-through text-slate-400 font-normal' : 'font-medium text-slate-100'
                              }`}
                            >
                              {itemText}
                            </span>
                          </button>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                isFulfilled
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border-amber-800'
                              }`}
                            >
                              {isFulfilled ? 'Terpenuhi' : 'Belum Siap'}
                            </span>

                            {!isFulfilled && (
                              <button
                                onClick={() => handleQuickAllocateFromRider(itemText, key)}
                                title="Cari & Alokasikan dari Gudang"
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold transition shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Alokasikan</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Microphone & Monitor Specs */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Microphone & Wireless System Spec:</span>
                    <span className="text-[10px] text-slate-500">
                      {currentArtist.technicalRider?.microphoneSpec?.length || 0} item
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(currentArtist.technicalRider?.microphoneSpec || [
                      'Shure Axient Digital Wireless SM58',
                      'Sennheiser e604 Tom Mics',
                      'Shure Beta 91A Kick Mic',
                    ]).map((itemText: string, mIdx: number) => {
                      const key = `${currentArtist.id || activeArtistIndex}_mic_${mIdx}`;
                      const isFulfilled = Boolean(fulfilledRiders[key]);

                      return (
                        <div
                          key={mIdx}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                            isFulfilled
                              ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                              : 'bg-slate-900/90 border-slate-800 text-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => toggleRiderFulfillment(key)}
                            className="flex items-center space-x-2.5 text-left min-w-0 flex-1 group"
                          >
                            {isFulfilled ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
                            )}
                            <span
                              className={`text-xs ${
                                isFulfilled ? 'line-through text-slate-400 font-normal' : 'font-medium text-slate-100'
                              }`}
                            >
                              {itemText}
                            </span>
                          </button>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                isFulfilled
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border-amber-800'
                              }`}
                            >
                              {isFulfilled ? 'Terpenuhi' : 'Belum Siap'}
                            </span>

                            {!isFulfilled && (
                              <button
                                onClick={() => handleQuickAllocateFromRider(itemText, key)}
                                title="Cari & Alokasikan dari Gudang"
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold transition shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Alokasikan</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Toolbar: Search, Category Filter, and View Switcher (Grid vs List) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search & Category Filter Pills */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alat dialokasikan, SKU, FOH..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Dropdown/Pills */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kategori ({requirements.length})</option>
            {CATEGORY_GROUPS.map((cg) => (
              <option key={cg.id} value={cg.id}>
                {cg.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ALLOCATED">ALLOCATED (Siap)</option>
            <option value="RESERVED">RESERVED (Terkunci)</option>
            <option value="REQUESTED">REQUESTED (Antrian)</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </div>

        {/* View Mode Toggle: Grid vs List + Print Button */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Print Checklist Button */}
          <button
            onClick={() => window.print()}
            title="Cetak Surat Jalan & Checklist Load-in"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Cetak Checklist</span>
          </button>

          {/* Grid vs List Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Grid Visual"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Tabel Compact"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Content Section: Categorized Grouping */}
      {groupedRequirements.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Package className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
          <div className="font-bold text-sm text-slate-300">
            Belum Ada Peralatan yang Dialokasikan
          </div>
          <p className="text-xs max-w-md mx-auto">
            Klik tombol &ldquo;+ Alokasikan Alat dari Gudang&rdquo; untuk memilih speaker, console mixer, lighting, atau genset langsung dari database inventaris Supabase.
          </p>
          <button
            onClick={() => {
              setPickerInitialSearch('');
              setIsPickerOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Alokasikan Alat Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedRequirements.map(({ group, items }) => {
            const GroupIcon = group.icon;
            const groupUnits = items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={group.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
              >
                {/* Category Header */}
                <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg border ${group.color}`}>
                      <GroupIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{group.name}</h4>
                      <div className="text-[10px] text-slate-400">
                        {items.length} SKU terdaftar &middot; Total {groupUnits} unit
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPickerInitialSearch(group.name.split(' ')[0]);
                      setIsPickerOpen(true);
                    }}
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tambah ke {group.name.split(' ')[0]}</span>
                  </button>
                </div>

                {/* Content: Mode Grid vs Mode List */}
                {viewMode === 'grid' ? (
                  /* MODE GRID */
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {items.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition group"
                      >
                        <div>
                          {/* Top row: SKU, Status, Delete */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {req.sku || 'SKU-GEN'}
                            </span>

                            <div className="flex items-center space-x-1.5">
                              {/* Status Badge (Clickable to Cycle) */}
                              <button
                                onClick={() => handleCycleStatus(req)}
                                title="Klik untuk ubah status ketersediaan"
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition hover:brightness-110 flex items-center gap-1 ${getStatusBadge(
                                  req.status
                                )}`}
                              >
                                <span>{req.status}</span>
                              </button>

                              {onDeleteRequirement && (
                                <button
                                  onClick={() => onDeleteRequirement(req.id)}
                                  title="Hapus alokasi barang"
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Image & Title */}
                          <div className="flex items-start space-x-3 mt-3">
                            <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                              {req.imageUrl ? (
                                <img
                                  src={req.imageUrl}
                                  alt={req.itemReference}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <GroupIcon className="w-6 h-6 text-slate-600" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-slate-100 line-clamp-2">
                                {req.itemReference}
                              </h5>
                              {req.notes && (
                                <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 italic">
                                  {req.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Placement, Quantity, Dates */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-300">
                            {/* Placement Area */}
                            <span className="flex items-center gap-1 text-[11px] text-indigo-300">
                              <MapPin className="w-3 h-3 text-indigo-400" />
                              <span className="truncate max-w-[140px]">
                                {req.placementArea || 'Main Stage'}
                              </span>
                            </span>

                            {/* Quantity */}
                            <span className="font-mono font-bold text-slate-100 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                              {req.quantity} {req.unit}
                            </span>
                          </div>

                          {/* Load-in & Load-out window */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{formatDate(req.requiredDate)}</span>
                            </span>
                            <span>&rarr;</span>
                            <span>{formatDate(req.returnDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* MODE LIST / TABLE (Print & Field Crew Friendly) */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Peralatan & SKU</th>
                          <th className="py-3 px-4">Penempatan Area</th>
                          <th className="py-3 px-4">Kuantitas</th>
                          <th className="py-3 px-4">Jadwal Load-in &rarr; Load-out</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {items.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {req.imageUrl ? (
                                    <img
                                      src={req.imageUrl}
                                      alt={req.itemReference}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <GroupIcon className="w-4 h-4 text-slate-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-100">{req.itemReference}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[10px] text-indigo-400">
                                      {req.sku || 'SKU-GEN'}
                                    </span>
                                    {req.notes && (
                                      <span className="text-[10px] text-slate-400 italic truncate max-w-xs">
                                        &middot; {req.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 text-[11px]">
                                <MapPin className="w-2.5 h-2.5 text-indigo-400" />
                                <span>{req.placementArea || 'Main Stage'}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-slate-100">
                              {req.quantity} {req.unit}
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                              {formatDate(req.requiredDate)} &rarr; {formatDate(req.returnDate)}
                            </td>

                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleCycleStatus(req)}
                                title="Klik untuk rotasi status"
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition hover:brightness-110 ${getStatusBadge(
                                  req.status
                                )}`}
                              >
                                {req.status}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right">
                              {onDeleteRequirement && (
                                <button
                                  onClick={() => onDeleteRequirement(req.id)}
                                  title="Hapus item alokasi"
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-950 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Supabase Interactive Item Picker Modal */}
      <InventoryItemPickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setPickerInitialSearch('');
        }}
        onAllocate={(itemData) => {
          onCreateRequirement({
            ...itemData,
            eventId: event.id,
            status: 'ALLOCATED',
          });
        }}
        defaultLoadInDate={event.loadInDate || event.startDate}
        defaultLoadOutDate={event.loadOutDate || event.endDate}
        initialSearch={pickerInitialSearch}
      />
    </div>
  );
}
