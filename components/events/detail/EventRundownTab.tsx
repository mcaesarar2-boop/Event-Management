'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Volume2,
  Lightbulb,
  Tv,
  Flame,
  User,
  X,
  Printer,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { RundownItem, Event } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface EventRundownTabProps {
  event: Event;
  rundown: RundownItem[];
  onCreateRundownItem: (item: Omit<RundownItem, 'id' | 'order'>) => void;
  onUpdateRundownItem?: (id: string, data: Partial<RundownItem>) => void;
  onDeleteRundownItem?: (id: string) => void;
  onReorderRundown: (newOrderedIds: string[]) => void;
}

export function EventRundownTab({
  event,
  rundown,
  onCreateRundownItem,
  onUpdateRundownItem,
  onDeleteRundownItem,
  onReorderRundown,
}: EventRundownTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RundownItem | null>(null);
  const [filterArea, setFilterArea] = useState<string>('ALL');

  // Dynamically compute event day schedule based on event start/end dates
  const dynamicDays = useMemo(() => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate || event.startDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Also check highest dayNumber in existing rundown items
    const maxDayInRundown = rundown.reduce((max, r) => Math.max(max, r.dayNumber || 1), 1);
    const totalDays = Math.max(daysCount, maxDayInRundown);

    const list = [];
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + (i - 1));
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        dayNumber: i,
        dateStr,
        label: `Hari ${i}`,
        formattedDate: formatDate(dateStr),
      });
    }
    return list;
  }, [event.startDate, event.endDate, rundown]);

  // Selected Day Tab (1, 2, 3... or 'ALL')
  const [selectedDay, setSelectedDay] = useState<number | 'ALL'>(() => {
    return dynamicDays.length > 1 ? 1 : 'ALL';
  });

  // Additional manual days added by user
  const [manualDayCount, setManualDayCount] = useState<number>(dynamicDays.length);
  const allDays = useMemo(() => {
    if (manualDayCount <= dynamicDays.length) return dynamicDays;
    const start = new Date(event.startDate);
    const list = [...dynamicDays];
    for (let i = dynamicDays.length + 1; i <= manualDayCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + (i - 1));
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        dayNumber: i,
        dateStr,
        label: `Hari ${i}`,
        formattedDate: formatDate(dateStr),
      });
    }
    return list;
  }, [dynamicDays, manualDayCount, event.startDate]);

  // Form State
  const [dayNumber, setDayNumber] = useState<number>(selectedDay === 'ALL' ? 1 : selectedDay);
  const [dateStr, setDateStr] = useState<string>(event.startDate.split('T')[0]);
  const [time, setTime] = useState('19:00 - 20:00');
  const [duration, setDuration] = useState(60);
  const [segment, setSegment] = useState('');
  const [talent, setTalent] = useState('Band / Talent');
  const [venueArea, setVenueArea] = useState('Main Stage');
  const [pic, setPic] = useState('Stage Manager');
  const [technicalCue, setTechnicalCue] = useState('Standby on stage left');
  const [audioCue, setAudioCue] = useState('Recall Scene 05 - Main Vocal FX');
  const [lightingCue, setLightingCue] = useState('Cue 12: Warm Amber wash, blinders ready');
  const [videoCue, setVideoCue] = useState('Visual Loop Track 03 (4K sync)');
  const [specialEffect, setSpecialEffect] = useState('CO2 Jets on final chorus');
  const [notes, setNotes] = useState('');

  // Sorted and filtered items
  const sortedRundown = useMemo(() => {
    return [...rundown].sort((a, b) => {
      const dayA = a.dayNumber || 1;
      const dayB = b.dayNumber || 1;
      if (dayA !== dayB) return dayA - dayB;
      return a.order - b.order;
    });
  }, [rundown]);

  const filteredItems = useMemo(() => {
    let list = sortedRundown;
    if (selectedDay !== 'ALL') {
      list = list.filter((r) => (r.dayNumber || 1) === selectedDay);
    }
    if (filterArea !== 'ALL') {
      list = list.filter((r) => r.venueArea === filterArea);
    }
    return list;
  }, [sortedRundown, selectedDay, filterArea]);

  // Day summary metrics
  const daySummary = useMemo(() => {
    const totalDurationMins = filteredItems.reduce((sum, r) => sum + (r.duration || 0), 0);
    const hours = Math.floor(totalDurationMins / 60);
    const mins = totalDurationMins % 60;
    return {
      totalSegments: filteredItems.length,
      durationStr: hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`,
    };
  }, [filteredItems]);

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    const currentItem = filteredItems[index];
    const targetItem = filteredItems[targetIndex];

    // Swap order
    const newOrderedIds = sortedRundown.map((it) => {
      if (it.id === currentItem.id) return targetItem.id;
      if (it.id === targetItem.id) return currentItem.id;
      return it.id;
    });

    onReorderRundown(newOrderedIds);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    const defaultDay = selectedDay === 'ALL' ? 1 : selectedDay;
    const targetDayObj = allDays.find((d) => d.dayNumber === defaultDay);
    setDayNumber(defaultDay);
    setDateStr(targetDayObj ? targetDayObj.dateStr : event.startDate.split('T')[0]);
    setTime('19:00 - 20:00');
    setDuration(60);
    setSegment('');
    setTalent('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: RundownItem) => {
    setEditingItem(item);
    setDayNumber(item.dayNumber || 1);
    setDateStr(item.date || event.startDate.split('T')[0]);
    setTime(item.time);
    setDuration(item.duration);
    setSegment(item.segment);
    setTalent(item.talent);
    setVenueArea(item.venueArea);
    setPic(item.pic);
    setTechnicalCue(item.technicalCue);
    setAudioCue(item.audioCue);
    setLightingCue(item.lightingCue);
    setVideoCue(item.videoCue);
    setSpecialEffect(item.specialEffect);
    setNotes(item.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segment.trim()) return;

    if (editingItem && onUpdateRundownItem) {
      onUpdateRundownItem(editingItem.id, {
        dayNumber: Number(dayNumber),
        date: dateStr,
        time,
        duration: Number(duration),
        segment,
        description: segment,
        talent,
        venueArea,
        pic,
        technicalCue,
        audioCue,
        lightingCue,
        videoCue,
        specialEffect,
        notes,
      });
    } else {
      onCreateRundownItem({
        eventId: event.id,
        dayNumber: Number(dayNumber),
        date: dateStr,
        time,
        duration: Number(duration),
        segment,
        description: segment,
        talent,
        venueArea,
        pic,
        technicalCue,
        audioCue,
        lightingCue,
        videoCue,
        specialEffect,
        notes,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Master Production Rundown & Multi-Day Cue Sheet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen rundown hari-H presisi per hari untuk panggung utama, cue FOH audio, lighting console, videotron, dan SFX.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Cue Sheet</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Rundown Segment</span>
          </button>
        </div>
      </div>

      {/* Multi-Day Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 touch-scroll">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 flex-shrink-0 ${
              selectedDay === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Hari ({rundown.length})</span>
          </button>

          {allDays.map((d) => {
            const countForDay = rundown.filter((r) => (r.dayNumber || 1) === d.dayNumber).length;
            const isSelected = selectedDay === d.dayNumber;

            return (
              <button
                key={d.dayNumber}
                onClick={() => setSelectedDay(d.dayNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{d.label}</span>
                <span className="text-[10px] opacity-80">({d.formattedDate})</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {countForDay}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setManualDayCount((prev) => prev + 1)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-indigo-400 border border-indigo-900/50 hover:border-indigo-700 text-xs font-medium transition flex items-center gap-1 flex-shrink-0"
            title="Tambah hari pertunjukan berikutnya"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Hari</span>
          </button>
        </div>

        {/* Day Metric Pill & Filter Area */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-slate-400 hidden lg:block">
            <span className="font-semibold text-slate-200">{daySummary.totalSegments} Segmen</span> &bull;{' '}
            <span>Durasi: {daySummary.durationStr}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Area</option>
              <option value="Main Stage">Main Stage</option>
              <option value="Main Stage Center">Main Stage Center</option>
              <option value="Festival Plaza & Stage Left">Festival Plaza</option>
              <option value="Gate 1, 2, 3 & Festival Plaza">Gate Area</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cue Sheet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 w-32">Hari & Jam</th>
                <th className="py-3 px-4">Segmen & Talent</th>
                <th className="py-3 px-3">Area & PIC</th>
                <th className="py-3 px-4">Audio Cue (FOH)</th>
                <th className="py-3 px-4">Lighting Cue</th>
                <th className="py-3 px-4">Video & SFX</th>
                <th className="py-3 px-3 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    Belum ada segmen rundown untuk filter ini. Klik &quot;+ Add Rundown Segment&quot; di atas untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition group">
                    <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-indigo-300 text-xs">{r.time}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          Hari {r.dayNumber || 1}
                        </span>
                        <span>{r.duration}m</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 text-xs">{r.segment}</div>
                      {r.talent && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span>{r.talent}</span>
                        </div>
                      )}
                      {r.notes && (
                        <div className="text-[10px] text-slate-500 mt-1 italic leading-tight">
                          Note: {r.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">{r.venueArea}</div>
                      <div className="text-[10px] text-slate-400">{r.pic}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-start gap-1.5 text-slate-300">
                        <Volume2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] font-mono leading-tight">{r.audioCue || '-'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-start gap-1.5 text-slate-300">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{r.lightingCue || '-'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {r.videoCue && (
                          <div className="flex items-center gap-1.5 text-indigo-300 text-[11px]">
                            <Tv className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{r.videoCue}</span>
                          </div>
                        )}
                        {r.specialEffect && r.specialEffect !== 'None' && (
                          <div className="flex items-center gap-1.5 text-rose-400 text-[10px]">
                            <Flame className="w-3 h-3 flex-shrink-0" />
                            <span>{r.specialEffect}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => moveItem(idx, 'UP')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Pindah naik"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(idx, 'DOWN')}
                          disabled={idx === filteredItems.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Pindah turun"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                          title="Edit segmen"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteRundownItem && (
                          <button
                            onClick={() => onDeleteRundownItem(r.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                            title="Hapus segmen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT RUNDOWN SEGMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{editingItem ? 'Edit Segmen Rundown' : 'Tambah Segmen Rundown & Cue Sheet'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tentukan hari pelaksanaan, waktu, instruksi teknis audio, lighting, videotron, dan SFX.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Day & Date Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-indigo-400 font-bold mb-1">Pilih Hari Pelaksanaan</label>
                  <select
                    value={dayNumber}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDayNumber(val);
                      const dObj = allDays.find((d) => d.dayNumber === val);
                      if (dObj) setDateStr(dObj.dateStr);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {allDays.map((d) => (
                      <option key={d.dayNumber} value={d.dayNumber}>
                        {d.label} ({d.formattedDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Jam & Durasi (menit)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="19:00 - 20:00"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-2/3 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="60"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Segment & Talent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nama Segmen Acara</label>
                  <input
                    type="text"
                    placeholder="Contoh: Performance Sheila On 7 / Sambutan Rektor"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Talent / Artis / Pembicara</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sheila On 7 / MC Yudha & Cindy"
                    value={talent}
                    onChange={(e) => setTalent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Area & PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Area Panggung / Venue</label>
                  <input
                    type="text"
                    value={venueArea}
                    onChange={(e) => setVenueArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Cues */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Instruksi Cue Teknis Lapangan
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sky-400 font-medium mb-1 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Cue (FOH Engineer)</span>
                    </label>
                    <input
                      type="text"
                      value={audioCue}
                      onChange={(e) => setAudioCue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 font-medium mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Lighting Cue (Lighting Designer)</span>
                    </label>
                    <input
                      type="text"
                      value={lightingCue}
                      onChange={(e) => setLightingCue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-indigo-400 font-medium mb-1 flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5" />
                      <span>Video Cue (VJ / Videotron)</span>
                    </label>
                    <input
                      type="text"
                      value={videoCue}
                      onChange={(e) => setVideoCue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-400 font-medium mb-1 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Special Effect (CO2, Pyro, Confetti)</span>
                    </label>
                    <input
                      type="text"
                      value={specialEffect}
                      onChange={(e) => setSpecialEffect(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Catatan Tambahan / Cue Penting</label>
                  <input
                    type="text"
                    placeholder="Contoh: Curfew pukul 23:00 WIB, sterilkan jalur ambulans Gate 4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Segmen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
