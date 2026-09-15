'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Check,
  Tag,
} from 'lucide-react';
import { Event, ProductionMilestone, MilestoneTag } from '@/lib/types';
import { formatDate, calculateDaysUntil } from '@/lib/utils/format';
import { EventTabType } from './EventDetailHeader';
import { ProductionTimelineTable } from '../timeline/ProductionTimelineTable';
import {
  DEFAULT_MILESTONE_TAGS,
  getMilestoneColorClasses,
} from '@/lib/utils/timelineColors';

interface EventTimelineTabProps {
  event: Event;
  onUpdateEvent: (id: string, data: Partial<Event>) => void;
  onNavigateTab: (tab: EventTabType) => void;
  onNavigateView?: (view: any) => void;
}

export function EventTimelineTab({
  event,
  onUpdateEvent,
  onNavigateTab,
  onNavigateView,
}: EventTimelineTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<MilestoneTag[]>(DEFAULT_MILESTONE_TAGS);

  // Initial milestones derived from event.milestones or core dates
  const initialMilestones = useMemo<ProductionMilestone[]>(() => {
    if (event.milestones && event.milestones.length > 0) {
      return event.milestones;
    }
    if (event.customMilestones && event.customMilestones.length > 0) {
      return event.customMilestones;
    }

    // Default 7 core phases fallback
    const list: ProductionMilestone[] = [];

    if (event.loadInDate || event.startDate) {
      list.push({
        id: 'ms-loadin',
        date: (event.loadInDate || event.startDate).split('T')[0],
        time: '08:00',
        tagId: 'tag-load-in',
        tagLabel: 'Load-In & Rigging',
        tagColor: 'sky',
        title: 'Load-In Logistik, Genset PLN & Rigging Truss Panggung',
        status: 'SCHEDULED',
      });
    }

    if (event.setupDate) {
      list.push({
        id: 'ms-setup',
        date: event.setupDate.split('T')[0],
        time: '09:00',
        tagId: 'tag-setup',
        tagLabel: 'Setup & Staging',
        tagColor: 'amber',
        title: 'Instalasi FOH Sound Console, Lighting Fixtures & LED Screen',
        status: 'SCHEDULED',
      });
    }

    if (event.technicalRehearsalDate) {
      list.push({
        id: 'ms-techreh',
        date: event.technicalRehearsalDate.split('T')[0],
        time: '14:00',
        tagId: 'tag-rehearsal',
        tagLabel: 'Rehearsal / GR',
        tagColor: 'purple',
        title: 'Technical Rehearsal (Dry Run), Audio Tuning & Lighting Cue',
        status: 'SCHEDULED',
      });
    }

    if (event.generalRehearsalDate) {
      list.push({
        id: 'ms-genreh',
        date: event.generalRehearsalDate.split('T')[0],
        time: '19:00',
        tagId: 'tag-rehearsal',
        tagLabel: 'Rehearsal / GR',
        tagColor: 'purple',
        title: 'General Rehearsal (GR) / Geladi Bersih all talent, MC & stage crew',
        status: 'SCHEDULED',
      });
    }

    if (event.eventDayDate || event.startDate) {
      list.push({
        id: 'ms-showday',
        date: (event.eventDayDate || event.startDate).split('T')[0],
        time: '14:00',
        tagId: 'tag-show-day',
        tagLabel: 'Show Day',
        tagColor: 'rose',
        title: 'SHOW DAY (Event Live / Konser Utama)',
        status: 'SCHEDULED',
      });
    }

    if (event.strikeDate) {
      list.push({
        id: 'ms-strike',
        date: event.strikeDate.split('T')[0],
        time: '00:00',
        tagId: 'tag-strike',
        tagLabel: 'Strike / Bongkaran',
        tagColor: 'orange',
        title: 'Strike & Stage Dismantling (Bongkaran sound, visual & rigging)',
        status: 'SCHEDULED',
      });
    }

    if (event.loadOutDate || event.endDate) {
      list.push({
        id: 'ms-loadout',
        date: (event.loadOutDate || event.endDate).split('T')[0],
        time: '18:00',
        tagId: 'tag-strike',
        tagLabel: 'Strike / Bongkaran',
        tagColor: 'orange',
        title: 'Load-Out, Pembersihan Area & Serah Terima Venue',
        status: 'SCHEDULED',
      });
    }

    return list;
  }, [event]);

  // Edit State for modal
  const [editMilestones, setEditMilestones] = useState<ProductionMilestone[]>(initialMilestones);

  useEffect(() => {
    setEditMilestones(initialMilestones);
  }, [initialMilestones]);

  // Extract unique tags present across milestones
  useEffect(() => {
    if (event.milestones && event.milestones.length > 0) {
      const customTagsMap = new Map<string, MilestoneTag>();
      event.milestones.forEach((m) => {
        if (m.tagId && m.tagLabel && !customTagsMap.has(m.tagId)) {
          customTagsMap.set(m.tagId, {
            id: m.tagId,
            label: m.tagLabel,
            color: m.tagColor || 'indigo',
          });
        }
      });
      if (customTagsMap.size > 0) {
        setAvailableTags((prev) => {
          const merged = [...prev];
          customTagsMap.forEach((tag, id) => {
            if (!merged.some((t) => t.id === id)) {
              merged.push(tag);
            }
          });
          return merged;
        });
      }
    }
  }, [event.milestones]);

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

  // Save Milestones and update event dates
  const handleSaveMilestones = (updatedMilestones: ProductionMilestone[]) => {
    const sortedDates = updatedMilestones.map((m) => m.date).filter(Boolean).sort();
    const minDate = sortedDates[0] || event.startDate?.split('T')[0] || new Date().toISOString().split('T')[0];
    const maxDate = sortedDates[sortedDates.length - 1] || event.endDate?.split('T')[0] || minDate;

    // Map backwards-compatible phase dates
    const showDayItem = updatedMilestones.find(
      (m) => m.tagLabel?.toLowerCase().includes('show') || m.category === 'SHOW_DAY'
    );
    const loadInItem =
      updatedMilestones.find((m) => m.tagLabel?.toLowerCase().includes('load-in') || m.category === 'LOAD_IN') ||
      updatedMilestones[0];
    const setupItem =
      updatedMilestones.find((m) => m.tagLabel?.toLowerCase().includes('setup') || m.category === 'SETUP') ||
      updatedMilestones[1];
    const techRehItem = updatedMilestones.find(
      (m) =>
        m.tagLabel?.toLowerCase().includes('tech') ||
        (m.category === 'REHEARSAL' && m.title?.toLowerCase().includes('tech'))
    );
    const genRehItem = updatedMilestones.find(
      (m) =>
        m.tagLabel?.toLowerCase().includes('gr') ||
        m.tagLabel?.toLowerCase().includes('general') ||
        (m.category === 'REHEARSAL' && !m.title?.toLowerCase().includes('tech'))
    );
    const strikeItem =
      updatedMilestones.find((m) => m.tagLabel?.toLowerCase().includes('strike') || m.category === 'STRIKE') ||
      updatedMilestones[updatedMilestones.length - 2];
    const loadOutItem =
      updatedMilestones.find((m) => m.tagLabel?.toLowerCase().includes('load-out') || m.category === 'LOAD_OUT') ||
      updatedMilestones[updatedMilestones.length - 1] ||
      strikeItem;

    const eventDayDateTime = showDayItem
      ? `${showDayItem.date}T${showDayItem.time || '14:00'}:00Z`
      : `${minDate}T14:00:00Z`;

    onUpdateEvent(event.id, {
      startDate: `${minDate}T08:00:00Z`,
      endDate: `${maxDate}T23:59:00Z`,
      loadInDate: loadInItem ? `${loadInItem.date}T${loadInItem.time || '08:00'}:00Z` : event.loadInDate,
      setupDate: setupItem ? `${setupItem.date}T${setupItem.time || '09:00'}:00Z` : event.setupDate,
      technicalRehearsalDate: techRehItem ? `${techRehItem.date}T${techRehItem.time || '14:00'}:00Z` : event.technicalRehearsalDate,
      generalRehearsalDate: genRehItem ? `${genRehItem.date}T${genRehItem.time || '19:00'}:00Z` : event.generalRehearsalDate,
      eventDayDate: eventDayDateTime,
      strikeDate: strikeItem ? `${strikeItem.date}T${strikeItem.time || '00:00'}:00Z` : event.strikeDate,
      loadOutDate: loadOutItem ? `${loadOutItem.date}T${loadOutItem.time || '18:00'}:00Z` : event.loadOutDate,
      milestones: updatedMilestones,
      customMilestones: updatedMilestones,
    });

    setIsEditModalOpen(false);
  };

  const activeMilestones = event.milestones && event.milestones.length > 0 ? event.milestones : initialMilestones;

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
            <span>Edit Tanggal Timeline Produksi</span>
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
            {calculateDaysUntil(event.loadInDate || event.startDate).label}
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {activeMilestones.length} Tahapan Terjadwal
            </span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded hover:bg-slate-850 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Timeline</span>
            </button>
          </div>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {activeMilestones.map((m, idx) => {
            const statusInfo = getPhaseStatus(m.date);
            const isShowDay = m.tagLabel?.toLowerCase().includes('show') || m.category === 'SHOW_DAY';
            const colorStyle = getMilestoneColorClasses(m.tagColor || 'indigo');

            return (
              <div
                key={m.id || idx}
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Tag Pill Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${colorStyle.pillBg} ${colorStyle.pillText} ${colorStyle.pillBorder}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.dot}`} />
                        <span>{m.tagLabel || 'Milestone'}</span>
                      </span>

                      {/* Agenda Title */}
                      <span className="text-xs font-bold text-slate-100">
                        {m.title || m.name || 'Agenda Produksi'}
                      </span>

                      {isShowDay && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-semibold border border-rose-700">
                          Main Target
                        </span>
                      )}
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {m.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:text-right flex-shrink-0">
                    <div>
                      <div className="text-xs font-semibold text-slate-200 font-mono">
                        {m.date ? formatDate(m.date) : 'Tanggal belum diatur'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 sm:justify-end mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{m.time ? `${m.time} WIB` : '08:00 WIB'}</span>
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
        </div>
      </div>

      {/* EDIT INTERACTIVE PRODUCTION TIMELINE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full p-5 space-y-4 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-400" />
                  <span>Edit Tanggal Timeline Produksi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kelola jadwal tahapan produksi secara interaktif, lengkap dengan agenda aktivitas ("ngapain") dan label dinamis.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Table Component */}
            <ProductionTimelineTable
              milestones={editMilestones}
              onChangeMilestones={setEditMilestones}
              referenceShowDay={event.eventDayDate?.split('T')[0] || event.startDate?.split('T')[0]}
              availableTags={availableTags}
              onTagsChange={setAvailableTags}
            />

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveMilestones(editMilestones)}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan Timeline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
