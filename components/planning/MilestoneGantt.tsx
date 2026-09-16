'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin,
  Users,
  ShieldAlert,
  ArrowRight,
  Calendar,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { Event, Task } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface MilestoneGanttProps {
  events: Event[];
  tasks: Task[];
  onSelectEvent: (eventId: string) => void;
  onOpenCreateEvent?: () => void;
}

interface PhaseBar {
  id: string;
  name: string;
  category: 'PRE' | 'LOAD_IN' | 'PRODUCTION' | 'REHEARSAL' | 'SHOW' | 'POST';
  startDateStr: string;
  endDateStr: string;
  startOffsetDays: number; // relative to event loadIn or start
  durationDays: number;
  progressPercent: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'DELAYED';
  color: string;
  pic: string;
}

export function MilestoneGantt({
  events,
  tasks,
  onSelectEvent,
  onOpenCreateEvent,
}: MilestoneGanttProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || 'ALL'
  );

  useEffect(() => {
    if (events.length > 0 && selectedEventId === 'ALL') {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);
  const [zoomScale, setZoomScale] = useState<'DAYS' | 'WEEKS'>('DAYS');
  const [currentTimestamp] = useState(() => Date.now());

  // Currently active selected event
  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Compute production phases for the selected event
  const phases = useMemo<PhaseBar[]>(() => {
    if (!currentEvent) return [];

    const now = currentTimestamp;
    const eventDayMs = new Date(currentEvent.eventDayDate || currentEvent.startDate).getTime();
    const loadInMs = currentEvent.loadInDate
      ? new Date(currentEvent.loadInDate).getTime()
      : eventDayMs - 4 * 86400000;
    const setupMs = currentEvent.setupDate
      ? new Date(currentEvent.setupDate).getTime()
      : eventDayMs - 3 * 86400000;
    const techMs = currentEvent.technicalRehearsalDate
      ? new Date(currentEvent.technicalRehearsalDate).getTime()
      : eventDayMs - 2 * 86400000;
    const grMs = currentEvent.generalRehearsalDate
      ? new Date(currentEvent.generalRehearsalDate).getTime()
      : eventDayMs - 1 * 86400000;
    const strikeMs = currentEvent.strikeDate
      ? new Date(currentEvent.strikeDate).getTime()
      : eventDayMs + 1 * 86400000;
    const loadOutMs = currentEvent.loadOutDate
      ? new Date(currentEvent.loadOutDate).getTime()
      : eventDayMs + 2 * 86400000;

    const baseStart = loadInMs - 10 * 86400000; // Pre-production 10 days before load-in

    const toOffset = (ms: number) => Math.max(0, Math.round((ms - baseStart) / 86400000));
    const toDateStr = (ms: number) => new Date(ms).toISOString().split('T')[0];

    const getStatus = (start: number, end: number) => {
      if (now >= end) return { status: 'COMPLETED' as const, progressPercent: 100 };
      if (now >= start && now < end) {
        const p = Math.min(95, Math.max(10, Math.round(((now - start) / (end - start)) * 100)));
        return { status: 'IN_PROGRESS' as const, progressPercent: p };
      }
      return { status: 'UPCOMING' as const, progressPercent: 0 };
    };

    const phaseList: PhaseBar[] = [
      {
        id: 'phase-pre',
        name: 'Pre-Production, Permitting & Legal Licensing',
        category: 'PRE',
        startDateStr: toDateStr(baseStart),
        endDateStr: toDateStr(loadInMs - 1 * 86400000),
        startOffsetDays: 0,
        durationDays: 10,
        ...getStatus(baseStart, loadInMs - 1 * 86400000),
        color: 'bg-indigo-500',
        pic: currentEvent.pics?.projectManager || 'Project Manager',
      },
      {
        id: 'phase-loadin',
        name: 'Load-In Logistik, Genset & Rigging Truss',
        category: 'LOAD_IN',
        startDateStr: toDateStr(loadInMs),
        endDateStr: toDateStr(setupMs),
        startOffsetDays: toOffset(loadInMs),
        durationDays: Math.max(1, Math.round((setupMs - loadInMs) / 86400000)),
        ...getStatus(loadInMs, setupMs),
        color: 'bg-sky-500',
        pic: currentEvent.pics?.productionPIC || 'Hendra Setiawan',
      },
      {
        id: 'phase-setup',
        name: 'Staging, Sound Line-Array & LED Wall Setup',
        category: 'PRODUCTION',
        startDateStr: toDateStr(setupMs),
        endDateStr: toDateStr(techMs),
        startOffsetDays: toOffset(setupMs),
        durationDays: Math.max(1, Math.round((techMs - setupMs) / 86400000)),
        ...getStatus(setupMs, techMs),
        color: 'bg-amber-500',
        pic: currentEvent.pics?.technicalPIC || 'Ir. Johanes Handoko',
      },
      {
        id: 'phase-rehearsal',
        name: 'Soundcheck, Lighting Patching & GR Dress Rehearsal',
        category: 'REHEARSAL',
        startDateStr: toDateStr(techMs),
        endDateStr: toDateStr(eventDayMs),
        startOffsetDays: toOffset(techMs),
        durationDays: Math.max(2, Math.round((eventDayMs - techMs) / 86400000)),
        ...getStatus(techMs, eventDayMs),
        color: 'bg-purple-500',
        pic: currentEvent.pics?.creativePIC || 'Show Director',
      },
      {
        id: 'phase-show',
        name: 'SHOW DAY (Live Concert / Main Event)',
        category: 'SHOW',
        startDateStr: toDateStr(eventDayMs),
        endDateStr: toDateStr(eventDayMs + 1 * 86400000),
        startOffsetDays: toOffset(eventDayMs),
        durationDays: 1,
        ...getStatus(eventDayMs, eventDayMs + 1 * 86400000),
        color: 'bg-rose-500',
        pic: currentEvent.pics?.eventPIC || 'Floor Manager',
      },
      {
        id: 'phase-strike',
        name: 'Strike Dismantle & Rigging Teardown',
        category: 'POST',
        startDateStr: toDateStr(strikeMs),
        endDateStr: toDateStr(loadOutMs),
        startOffsetDays: toOffset(strikeMs),
        durationDays: Math.max(1, Math.round((loadOutMs - strikeMs) / 86400000)),
        ...getStatus(strikeMs, loadOutMs),
        color: 'bg-orange-500',
        pic: currentEvent.pics?.productionPIC || 'Production Lead',
      },
      {
        id: 'phase-post',
        name: 'Load-Out, Venue Cleaning & Financial Settlement',
        category: 'POST',
        startDateStr: toDateStr(loadOutMs),
        endDateStr: toDateStr(loadOutMs + 4 * 86400000),
        startOffsetDays: toOffset(loadOutMs),
        durationDays: 4,
        ...getStatus(loadOutMs, loadOutMs + 4 * 86400000),
        color: 'bg-emerald-500',
        pic: currentEvent.pics?.financePIC || 'Finance PIC',
      },
    ];

    return phaseList;
  }, [currentEvent, currentTimestamp]);

  // Total Gantt horizon days
  const totalHorizonDays = useMemo(() => {
    if (phases.length === 0) return 20;
    const lastPhase = phases[phases.length - 1];
    return Math.max(22, lastPhase.startOffsetDays + lastPhase.durationDays + 2);
  }, [phases]);

  // Critical Milestones List
  const criticalMilestones = useMemo(() => {
    if (!currentEvent) return [];

    const eventDay = currentEvent.eventDayDate || currentEvent.startDate;

    return [
      {
        id: 'ms-1',
        title: 'Izin Keramaian Kepolisian & Rekomendasi Satgas',
        targetDate: currentEvent.loadInDate?.split('T')[0] || eventDay.split('T')[0],
        status: 'READY' as const,
        pic: currentEvent.pics?.projectManager || 'Project Manager',
        criticality: 'CRITICAL' as const,
        description: 'Persetujuan resmi dari Ditintelkam Polda & pengelola venue.',
      },
      {
        id: 'ms-2',
        title: 'Talent Hospitality & Technical Rider Signoff',
        targetDate: currentEvent.loadInDate?.split('T')[0] || eventDay.split('T')[0],
        status: 'READY' as const,
        pic: currentEvent.pics?.eventPIC || 'Artist Liaison',
        criticality: 'HIGH' as const,
        description: 'Persetujuan tertulis seluruh riders instrumen dan hotel bintang 5.',
      },
      {
        id: 'ms-3',
        title: 'Rigging Truss Load Test & Structural Safety Certificate',
        targetDate: currentEvent.setupDate?.split('T')[0] || eventDay.split('T')[0],
        status: 'IN_PROGRESS' as const,
        pic: currentEvent.pics?.technicalPIC || 'Hendra Setiawan',
        criticality: 'CRITICAL' as const,
        description: 'Uji beban gantung line-array dan ketahanan angin rigging panggung.',
      },
      {
        id: 'ms-4',
        title: 'FOH Acoustic Calibration & SPL Level Signoff',
        targetDate: currentEvent.technicalRehearsalDate?.split('T')[0] || eventDay.split('T')[0],
        status: 'UPCOMING' as const,
        pic: currentEvent.pics?.technicalPIC || 'Ir. Johanes Handoko',
        criticality: 'HIGH' as const,
        description: 'Tuning sistem audio L-Acoustics K2 dan delay line.',
      },
      {
        id: 'ms-5',
        title: 'General Rehearsal (GR) Full Flow Run-through',
        targetDate: currentEvent.generalRehearsalDate?.split('T')[0] || eventDay.split('T')[0],
        status: 'UPCOMING' as const,
        pic: currentEvent.pics?.creativePIC || 'Show Director',
        criticality: 'HIGH' as const,
        description: 'Simulasi rundown menit ke menit bersama MC, Show Caller, dan Visual Playback.',
      },
      {
        id: 'ms-6',
        title: 'Doors Open, Gate Scanning & Security Standby',
        targetDate: eventDay.split('T')[0],
        status: 'UPCOMING' as const,
        pic: 'Bambang Kusuma',
        criticality: 'CRITICAL' as const,
        description: 'Kesiapan barikade Mojo, scanner tiket, dan jalur evakuasi penonton.',
      },
    ];
  }, [currentEvent]);

  // Countdown to D-Day
  const countdownDays = useMemo(() => {
    if (!currentEvent) return null;
    const target = new Date(currentEvent.eventDayDate || currentEvent.startDate).getTime();
    const diff = Math.ceil((target - currentTimestamp) / (1000 * 60 * 60 * 24));
    return diff;
  }, [currentEvent, currentTimestamp]);

  // Progress summary
  const completedPhasesCount = phases.filter((p) => p.status === 'COMPLETED').length;
  const inProgressPhasesCount = phases.filter((p) => p.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-400" />
              Production Milestones & Interactive Gantt
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
              {phases.length} Phases Tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualisasi roadmap produksi, durasi load-in, kesiapan staging, rehearsal, hingga strike & handover
          </p>
        </div>

        {/* Event Selector & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.code}: {evt.name}
                </option>
              ))}
            </select>
          )}

          {currentEvent && (
            <button
              onClick={() => onSelectEvent(currentEvent.id)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>Detail Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      {currentEvent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Target Show Day (D-Day)
              </p>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">
                {formatDate(currentEvent.eventDayDate || currentEvent.startDate)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {countdownDays !== null && countdownDays >= 0
                  ? `${countdownDays} hari lagi menuju show`
                  : 'Event telah terlaksana'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
              ★
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Fase Produksi Selesai
              </p>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">
                {completedPhasesCount} dari {phases.length} Fase
              </h3>
              <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((completedPhasesCount / (phases.length || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Venue & Lokasi
              </p>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5 truncate max-w-[170px]">
                {currentEvent.venueName}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentEvent.city} &middot; {currentEvent.expectedAttendance?.toLocaleString()} Pax
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Kesehatan Critical Path
              </p>
              <h3 className="text-base font-bold text-emerald-400 mt-0.5">ON SCHEDULE (100%)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Semua perizinan & rigging aman</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Gantt Timeline Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Board Header */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Timeline Gantt Chart: {currentEvent?.name || 'Event Roadmap'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rentang hari operasional dari tahap persiapan D-10 hingga post-event handover D+4
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Load-in
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Staging/AV
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Rehearsals
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Show Day
            </span>
          </div>
        </div>

        {/* Gantt Horizontal Bars Container */}
        <div className="p-4 overflow-x-auto touch-scroll">
          <div className="min-w-[760px] space-y-3">
            {/* Timeline Header Track (Day ticks) */}
            <div className="grid grid-cols-12 text-[10px] font-mono font-bold text-slate-500 uppercase pb-2 border-b border-slate-800 text-center">
              <div>H-10 Pre</div>
              <div>H-8 Prep</div>
              <div>H-6 Lic</div>
              <div>H-4 LoadIn</div>
              <div>H-3 Rig</div>
              <div>H-2 AV</div>
              <div>H-1 GR</div>
              <div className="text-rose-400 font-bold bg-rose-950/40 rounded py-0.5">D-DAY</div>
              <div>D+1 Strike</div>
              <div>D+2 Out</div>
              <div>D+3 Clean</div>
              <div>D+4 Settle</div>
            </div>

            {/* Render Each Phase as a Gantt Bar Row */}
            {phases.map((phase, idx) => {
              // Calculate horizontal placement
              const leftPercent = Math.min(92, (phase.startOffsetDays / totalHorizonDays) * 100);
              const widthPercent = Math.max(
                7,
                Math.min(100 - leftPercent, (phase.durationDays / totalHorizonDays) * 100)
              );

              return (
                <div
                  key={phase.id}
                  className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-2.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{phase.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {phase.startDateStr} &rarr; {phase.endDateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400">PIC: {phase.pic}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          phase.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : phase.status === 'IN_PROGRESS'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>
                  </div>

                  {/* Gantt Bar Track */}
                  <div className="relative w-full bg-slate-900 rounded-md h-6 overflow-hidden border border-slate-800">
                    <div
                      className={`absolute top-0 bottom-0 rounded-md shadow-md flex items-center px-2 text-[10px] font-bold text-white transition-all ${phase.color}`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    >
                      <span className="truncate">{phase.durationDays} Hari</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Milestone Checkpoints Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Critical Milestones & Gate Deliverables
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar titik kritis izin, riders, soundcheck, dan handover venue
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {criticalMilestones.map((ms) => (
            <div
              key={ms.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-850/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      ms.criticality === 'CRITICAL'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {ms.criticality}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100">{ms.title}</h4>
                </div>
                <p className="text-xs text-slate-400">{ms.description}</p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Target Deadline</span>
                  <p className="font-bold text-slate-200 font-mono">{formatDate(ms.targetDate)}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">PIC Bertanggung Jawab</span>
                  <p className="font-semibold text-slate-300">{ms.pic}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    ms.status === 'READY'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : ms.status === 'IN_PROGRESS'
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {ms.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
