'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  CalendarDays,
  List,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { Event, Task } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';
import { getMilestoneColorClasses } from '@/lib/utils/timelineColors';

export type MilestoneType =
  | 'EVENT_DAY'
  | 'LOAD_IN'
  | 'SETUP'
  | 'TECH_REHEARSAL'
  | 'GR'
  | 'STRIKE'
  | 'LOAD_OUT'
  | 'TASK_DUE'
  | (string & {});

export interface CalendarEntry {
  id: string;
  dateStr: string; // YYYY-MM-DD
  eventId: string;
  eventCode: string;
  eventName: string;
  venueName?: string;
  city?: string;
  type: MilestoneType | string;
  tagLabel?: string;
  tagColor?: string;
  title?: string;
  label: string;
  time?: string;
  priority?: string;
  assignee?: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

interface MasterCalendarProps {
  events: Event[];
  tasks: Task[];
  onSelectEvent: (eventId: string) => void;
  onOpenCreateEvent?: () => void;
  onNavigateToTimeline?: (eventId: string) => void;
}

export function MasterCalendar({
  events,
  tasks,
  onSelectEvent,
  onOpenCreateEvent,
  onNavigateToTimeline,
}: MasterCalendarProps) {
  const [viewMode, setViewMode] = useState<'MONTH' | 'AGENDA'>('MONTH');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [isFloatingPreviewOpen, setIsFloatingPreviewOpen] = useState(false);

  // Default month calculation: if events exist, center on the first active event's month
  const defaultDate = useMemo(() => {
    if (events.length > 0) {
      const targetDate = events[0].eventDayDate || events[0].startDate;
      if (targetDate) {
        const d = new Date(targetDate);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return new Date();
  }, [events]);

  const [currentYear, setCurrentYear] = useState<number>(defaultDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(defaultDate.getMonth()); // 0-indexed

  // Transform events and tasks into calendar entries
  const allEntries = useMemo(() => {
    const entries: CalendarEntry[] = [];

    events.forEach((evt) => {
      // Dynamic Production Milestones
      if (evt.milestones && evt.milestones.length > 0) {
        evt.milestones.forEach((m, mIdx) => {
          if (!m.date) return;
          const colorStyle = getMilestoneColorClasses(m.tagColor || 'indigo');
          const tagLabel = m.tagLabel || 'Milestone';
          const title = m.title || m.name || '';
          const displayLabel = title ? `${tagLabel}: ${title}` : tagLabel;

          entries.push({
            id: `${evt.id}-ms-${m.id || mIdx}`,
            dateStr: m.date.split('T')[0],
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: tagLabel,
            tagLabel: tagLabel,
            tagColor: m.tagColor || 'indigo',
            title: title,
            label: displayLabel,
            time: m.time ? `${m.time} WIB` : undefined,
            colorClass: {
              bg: colorStyle.bg,
              text: colorStyle.text,
              border: colorStyle.border,
              dot: colorStyle.dot,
            },
          });
        });
      } else {
        // Fallback for events without custom milestones
        // 1. Load-In
        if (evt.loadInDate) {
          const d = evt.loadInDate.split('T')[0];
          entries.push({
            id: `${evt.id}-loadin`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'LOAD_IN',
            tagLabel: 'Load-In & Rigging',
            tagColor: 'sky',
            label: 'Load-In & Rigging',
            time: '08:00 WIB',
            colorClass: {
              bg: 'bg-sky-950/80',
              text: 'text-sky-300',
              border: 'border-sky-700/60',
              dot: 'bg-sky-400',
            },
          });
        }

        // 2. Setup
        if (evt.setupDate) {
          const d = evt.setupDate.split('T')[0];
          entries.push({
            id: `${evt.id}-setup`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'SETUP',
            tagLabel: 'Setup & Staging',
            tagColor: 'amber',
            label: 'Stage & AV Setup',
            time: '09:00 WIB',
            colorClass: {
              bg: 'bg-amber-950/80',
              text: 'text-amber-300',
              border: 'border-amber-700/60',
              dot: 'bg-amber-400',
            },
          });
        }

        // 3. Technical Rehearsal / Soundcheck
        if (evt.technicalRehearsalDate) {
          const d = evt.technicalRehearsalDate.split('T')[0];
          entries.push({
            id: `${evt.id}-techreh`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'TECH_REHEARSAL',
            tagLabel: 'Rehearsal / GR',
            tagColor: 'purple',
            label: 'Soundcheck & Tech Rehearsal',
            time: '14:00 WIB',
            colorClass: {
              bg: 'bg-purple-950/80',
              text: 'text-purple-300',
              border: 'border-purple-700/60',
              dot: 'bg-purple-400',
            },
          });
        }

        // 4. General Rehearsal (GR)
        if (evt.generalRehearsalDate) {
          const d = evt.generalRehearsalDate.split('T')[0];
          entries.push({
            id: `${evt.id}-gr`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'GR',
            tagLabel: 'Rehearsal / GR',
            tagColor: 'purple',
            label: 'General Rehearsal (GR)',
            time: '19:00 WIB',
            colorClass: {
              bg: 'bg-violet-950/80',
              text: 'text-violet-300',
              border: 'border-violet-700/60',
              dot: 'bg-violet-400',
            },
          });
        }

        // 5. Main Event Day / Show Day
        if (evt.eventDayDate || evt.startDate) {
          const d = (evt.eventDayDate || evt.startDate).split('T')[0];
          entries.push({
            id: `${evt.id}-eventday`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'EVENT_DAY',
            tagLabel: 'Show Day',
            tagColor: 'rose',
            label: 'SHOW DAY (D-Day)',
            time: '15:00 - 23:00 WIB',
            colorClass: {
              bg: 'bg-rose-950/90',
              text: 'text-rose-200 font-bold',
              border: 'border-rose-600',
              dot: 'bg-rose-500 animate-pulse',
            },
          });
        }

        // 6. Strike / Bongkar
        if (evt.strikeDate) {
          const d = evt.strikeDate.split('T')[0];
          entries.push({
            id: `${evt.id}-strike`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'STRIKE',
            tagLabel: 'Strike / Bongkaran',
            tagColor: 'orange',
            label: 'Strike & Dismantle',
            time: '00:00 WIB',
            colorClass: {
              bg: 'bg-orange-950/80',
              text: 'text-orange-300',
              border: 'border-orange-700/60',
              dot: 'bg-orange-400',
            },
          });
        }

        // 7. Load-Out
        if (evt.loadOutDate) {
          const d = evt.loadOutDate.split('T')[0];
          entries.push({
            id: `${evt.id}-loadout`,
            dateStr: d,
            eventId: evt.id,
            eventCode: evt.code,
            eventName: evt.name,
            venueName: evt.venueName,
            city: evt.city,
            type: 'LOAD_OUT',
            tagLabel: 'Strike / Bongkaran',
            tagColor: 'orange',
            label: 'Load-out & Venue Handover',
            time: '20:00 WIB',
            colorClass: {
              bg: 'bg-slate-900',
              text: 'text-slate-300',
              border: 'border-slate-700',
              dot: 'bg-slate-400',
            },
          });
        }
      }
    });

    // 8. Task Deadlines
    tasks.forEach((tsk) => {
      if (tsk.dueDate) {
        const d = tsk.dueDate.split('T')[0];
        const matchingEvt = events.find((e) => e.id === tsk.eventId);
        entries.push({
          id: `task-${tsk.id}`,
          dateStr: d,
          eventId: tsk.eventId,
          eventCode: matchingEvt ? matchingEvt.code : 'TASK',
          eventName: matchingEvt ? matchingEvt.name : 'Operations Task',
          type: 'TASK_DUE',
          label: `Task: ${tsk.name}`,
          priority: tsk.priority,
          assignee: tsk.assignee,
          colorClass: {
            bg: 'bg-emerald-950/80',
            text: 'text-emerald-300',
            border: 'border-emerald-700/60',
            dot: 'bg-emerald-400',
          },
        });
      }
    });

    return entries;
  }, [events, tasks]);

  // Extract unique active milestone tags across all entries
  const activeMilestoneTags = useMemo(() => {
    const tagMap = new Map<string, { label: string; color: string }>();
    allEntries.forEach((entry) => {
      if (entry.type !== 'TASK_DUE') {
        const key = entry.type;
        if (!tagMap.has(key)) {
          tagMap.set(key, {
            label: entry.tagLabel || entry.type,
            color:
              entry.tagColor ||
              (entry.type === 'EVENT_DAY'
                ? 'rose'
                : entry.type === 'LOAD_IN'
                ? 'sky'
                : entry.type === 'SETUP'
                ? 'amber'
                : entry.type === 'TECH_REHEARSAL' || entry.type === 'GR'
                ? 'purple'
                : entry.type === 'STRIKE' || entry.type === 'LOAD_OUT'
                ? 'orange'
                : 'indigo'),
          });
        }
      }
    });
    return Array.from(tagMap.entries()).map(([key, val]) => ({
      key,
      label: val.label,
      color: val.color,
    }));
  }, [allEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      const matchesEvent = selectedEventFilter === 'ALL' || e.eventId === selectedEventFilter;
      const matchesCategory =
        selectedCategoryFilter === 'ALL' ||
        e.type === selectedCategoryFilter ||
        (selectedCategoryFilter === 'D_DAY' && (e.type === 'EVENT_DAY' || e.type.toLowerCase().includes('show'))) ||
        (selectedCategoryFilter === 'LOGISTICS' &&
          (e.type === 'LOAD_IN' ||
            e.type === 'SETUP' ||
            e.type === 'STRIKE' ||
            e.type === 'LOAD_OUT' ||
            e.type.toLowerCase().includes('load') ||
            e.type.toLowerCase().includes('strike'))) ||
        (selectedCategoryFilter === 'REHEARSAL' &&
          (e.type === 'TECH_REHEARSAL' ||
            e.type === 'GR' ||
            e.type.toLowerCase().includes('rehearsal') ||
            e.type.toLowerCase().includes('gr'))) ||
        (selectedCategoryFilter === 'TASKS' && e.type === 'TASK_DUE');

      return matchesEvent && matchesCategory;
    });
  }, [allEntries, selectedEventFilter, selectedCategoryFilter]);

  // Group entries by date for fast lookup
  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    filteredEntries.forEach((entry) => {
      const cur = map.get(entry.dateStr) || [];
      cur.push(entry);
      map.set(entry.dateStr, cur);
    });
    return map;
  }, [filteredEntries]);

  // Month navigation helpers
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const handleJumpToFirstEvent = () => {
    if (events[0]) {
      const d = new Date(events[0].eventDayDate || events[0].startDate);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  };

  // Build 42 grid cells (Sunday to Saturday or Monday to Sunday)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    // We'll use Monday as day 0 of the week: (firstDayOfMonth + 6) % 7
    const startingDayIndex = (firstDayOfMonth + 6) % 7;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler days
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month filler days (complete 35 or 42 cells)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Selected Day Details
  const selectedEntries = useMemo(() => {
    if (!selectedDayStr) return [];
    return entriesByDate.get(selectedDayStr) || [];
  }, [selectedDayStr, entriesByDate]);

  // Agenda items sorted by date
  const agendaDates = useMemo(() => {
    const dates = Array.from(entriesByDate.keys()).sort();
    return dates.map((dateStr) => ({
      dateStr,
      entries: entriesByDate.get(dateStr) || [],
    }));
  }, [entriesByDate]);

  // Handle cell click (1st click: highlight date, 2nd click: open floating window preview)
  const handleCellClick = (dateStr: string) => {
    if (selectedDayStr === dateStr) {
      setIsFloatingPreviewOpen(true);
    } else {
      setSelectedDayStr(dateStr);
    }
  };

  const handleOpenFloatingPreview = (dateStr: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDayStr(dateStr);
    setIsFloatingPreviewOpen(true);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              Master Operations Calendar
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
              {filteredEntries.length} Milestones
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Kalender terintegrasi otomatis dengan timeline Load-In, Setup, Rehearsal, D-Day, Strike, dan Task Deadlines
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {events.length > 0 && (
            <button
              onClick={handleJumpToFirstEvent}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Lompat ke bulan event aktif"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Event Aktif ({events[0].code})</span>
            </button>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                viewMode === 'MONTH' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Grid Bulanan</span>
            </button>
            <button
              onClick={() => setViewMode('AGENDA')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                viewMode === 'AGENDA' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Agenda</span>
            </button>
          </div>

          {onOpenCreateEvent && (
            <button
              onClick={onOpenCreateEvent}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Month Navigation Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-100 min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleJumpToToday}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Hari Ini
          </button>
        </div>

        {/* Dynamic Legend Indicators */}
        <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-slate-400 flex-wrap max-w-[500px]">
          {activeMilestoneTags.slice(0, 6).map((tag) => {
            const style = getMilestoneColorClasses(tag.color);
            return (
              <span key={tag.key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                <span className="truncate max-w-[120px]">{tag.label}</span>
              </span>
            );
          })}
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Task Due</span>
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Event */}
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Event Portfolio</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.code} - {evt.name}
              </option>
            ))}
          </select>

          {/* Filter Category / Dynamic Milestone Tags */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Tipe Milestone ({allEntries.length})</option>
            {activeMilestoneTags.map((tag) => (
              <option key={tag.key} value={tag.key}>
                {tag.label}
              </option>
            ))}
            <option value="TASKS">Deadline Tugas Saja</option>
          </select>
        </div>
      </div>

      {/* VIEW: MONTH GRID */}
      {viewMode === 'MONTH' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl overflow-x-auto touch-scroll">
          <div className="min-w-[650px]">
            {/* Day of Week Header */}
            <div className="grid grid-cols-7 bg-slate-950 border-b border-slate-800 text-center py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div>Senin</div>
              <div>Selasa</div>
              <div>Rabu</div>
              <div>Kamis</div>
              <div>Jumat</div>
              <div className="text-amber-400">Sabtu</div>
              <div className="text-rose-400">Minggu</div>
            </div>

            {/* 42 Calendar Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80">
            {calendarCells.map((cell) => {
              const entries = entriesByDate.get(cell.dateStr) || [];
              const isSelected = selectedDayStr === cell.dateStr;
              const hasShowDay = entries.some((e) => e.type === 'EVENT_DAY');

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleCellClick(cell.dateStr)}
                  onDoubleClick={() => handleOpenFloatingPreview(cell.dateStr)}
                  className={`min-h-[105px] p-2 transition cursor-pointer flex flex-col justify-between group relative ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-950/40 text-slate-600'
                      : isSelected
                      ? 'bg-indigo-950/50 ring-2 ring-inset ring-indigo-500 shadow-md'
                      : hasShowDay
                      ? 'bg-rose-950/20 hover:bg-rose-950/30'
                      : 'bg-slate-900 hover:bg-slate-850/60'
                  }`}
                >
                  {/* Top Cell Bar */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : !cell.isCurrentMonth
                          ? 'text-slate-600'
                          : isSelected
                          ? 'text-indigo-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {entries.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                        {entries.length}
                      </span>
                    )}
                  </div>

                  {/* Badges / Milestone Marks inside Cell */}
                  <div className="space-y-1 my-1.5 flex-1">
                    {entries.slice(0, 3).map((entry) => (
                      <div
                        key={entry.id}
                        onClick={(e) => handleOpenFloatingPreview(cell.dateStr, e)}
                        title={`${entry.eventCode}: ${entry.label} (${entry.time || ''}) - Klik untuk buka preview`}
                        className={`text-[10px] px-1.5 py-0.5 rounded border truncate flex items-center gap-1 cursor-pointer hover:brightness-125 transition ${entry.colorClass.bg} ${entry.colorClass.text} ${entry.colorClass.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.colorClass.dot}`}></span>
                        <span className="font-semibold truncate">
                          {entry.type === 'EVENT_DAY' ? '★ ' : ''}
                          {entry.eventCode}: {entry.label}
                        </span>
                      </div>
                    ))}

                    {entries.length > 3 && (
                      <div
                        onClick={(e) => handleOpenFloatingPreview(cell.dateStr, e)}
                        className="text-[9px] text-indigo-400 hover:underline font-medium px-1 cursor-pointer"
                      >
                        +{entries.length - 3} lainnya (buka preview)...
                      </div>
                    )}
                  </div>

                  {/* Bottom cell subtle indicator */}
                  <div className="text-[9px] flex items-center justify-between text-slate-500 group-hover:text-slate-300 mt-1">
                    <span className="truncate">{isSelected ? 'Klik lagi: Floating Preview' : ''}</span>
                    {entries.length > 0 && (
                      <span
                        onClick={(e) => handleOpenFloatingPreview(cell.dateStr, e)}
                        className="hover:text-indigo-400 font-semibold hover:underline flex-shrink-0"
                      >
                        Preview &rarr;
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: AGENDA LIST */}
      {viewMode === 'AGENDA' && (
        <div className="space-y-4">
          {agendaDates.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-200">Tidak ada agenda pada filter ini</h3>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter event atau kategori di atas.</p>
            </div>
          ) : (
            agendaDates.map(({ dateStr, entries }) => (
              <div
                key={dateStr}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-100">{formatDate(dateStr)}</span>
                    <span className="text-xs font-mono text-slate-400">({dateStr})</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {entries.length} Milestone
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => onSelectEvent(entry.eventId)}
                      className={`p-3 rounded-lg border cursor-pointer hover:scale-[1.01] transition flex flex-col justify-between ${entry.colorClass.bg} ${entry.colorClass.border}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/70 text-slate-300 border border-slate-800">
                            {entry.eventCode}
                          </span>
                          {entry.time && (
                            <span className="text-[10px] text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {entry.time}
                            </span>
                          )}
                        </div>

                        <h4 className={`text-xs font-bold mt-2 ${entry.colorClass.text}`}>
                          {entry.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{entry.eventName}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{entry.venueName || entry.assignee || 'Operations'}</span>
                        <span className="text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                          Buka Event &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DAY DETAIL DRAWER / INSPECTOR (Modal or expanded card when day is clicked) */}
      {selectedDayStr && (
        <div className="bg-slate-900 border border-indigo-500/50 rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-100">
                  Agenda Tanggal: {formatDate(selectedDayStr)}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedEntries.length > 0
                  ? `Ditemukan ${selectedEntries.length} jadwal/milestone pada tanggal ini.`
                  : 'Tidak ada jadwal terdaftar pada tanggal ini.'}
              </p>
            </div>

            <button
              onClick={() => setSelectedDayStr(null)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition"
            >
              Tutup Panel
            </button>
          </div>

          {selectedEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-lg border ${entry.colorClass.bg} ${entry.colorClass.border} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-indigo-300 font-bold border border-slate-800">
                        {entry.eventCode}
                      </span>
                      {entry.time && (
                        <span className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {entry.time}
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold mt-2 ${entry.colorClass.text}`}>
                      {entry.label}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-medium">{entry.eventName}</p>

                    {entry.venueName && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {entry.venueName} {entry.city ? `(${entry.city})` : ''}
                      </p>
                    )}

                    {entry.assignee && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        PIC: {entry.assignee}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {entry.type}
                    </span>
                    <button
                      onClick={() => {
                        if (onNavigateToTimeline) {
                          onNavigateToTimeline(entry.eventId);
                        } else {
                          onSelectEvent(entry.eventId);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Buka Timeline Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              Belum ada event atau task yang jatuh tempo pada {formatDate(selectedDayStr)}.
            </div>
          )}
        </div>
      )}

      {/* FLOATING WINDOW OVERVIEW / PREVIEW MODAL */}
      {isFloatingPreviewOpen && selectedDayStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-indigo-500/60 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      Timeline Overview: {formatDate(selectedDayStr)}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                      {selectedEntries.length} Jadwal
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ringkasan seluruh timeline operasional, D-Day, dan task deadline pada tanggal ini.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFloatingPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            {selectedEntries.length === 0 ? (
              <div className="py-10 text-center">
                <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Tidak ada timeline terdaftar pada tanggal ini</p>
                <p className="text-[11px] text-slate-500 mt-1">Anda dapat menambahkan event atau jadwal milestone baru.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border transition ${entry.colorClass.bg} ${entry.colorClass.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                          {entry.eventCode}
                        </span>
                        <span className="text-xs font-bold text-slate-100">
                          {entry.type === 'EVENT_DAY' ? '★ ' : ''}
                          {entry.label}
                        </span>
                        {entry.type === 'EVENT_DAY' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold animate-pulse">
                            SHOW DAY
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        {entry.eventName}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        {entry.time && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {entry.time}
                          </span>
                        )}
                        {entry.venueName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {entry.venueName} {entry.city ? `(${entry.city})` : ''}
                          </span>
                        )}
                        {entry.assignee && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            PIC: {entry.assignee}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsFloatingPreviewOpen(false);
                        if (onNavigateToTimeline) {
                          onNavigateToTimeline(entry.eventId);
                        } else {
                          onSelectEvent(entry.eventId);
                        }
                      }}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
                    >
                      <span>Buka Full View Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500">
                Klik tombol di atas untuk membuka tab timeline produksi event terkait.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFloatingPreviewOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Tutup
                </button>
                {selectedEntries[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFloatingPreviewOpen(false);
                      if (onNavigateToTimeline) {
                        onNavigateToTimeline(selectedEntries[0].eventId);
                      } else {
                        onSelectEvent(selectedEntries[0].eventId);
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <span>Full View Timeline Event &rarr;</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
