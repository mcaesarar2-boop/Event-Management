'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { RundownItem, Event } from '@/lib/types';

interface EventRundownTabProps {
  event: Event;
  rundown: RundownItem[];
  onCreateRundownItem: (item: Omit<RundownItem, 'id' | 'order'>) => void;
  onReorderRundown: (newOrderedIds: string[]) => void;
}

export function EventRundownTab({
  event,
  rundown,
  onCreateRundownItem,
  onReorderRundown,
}: EventRundownTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterArea, setFilterArea] = useState<string>('ALL');

  // Form State
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState(45);
  const [segment, setSegment] = useState('');
  const [talent, setTalent] = useState('Band');
  const [venueArea, setVenueArea] = useState('Main Stage');
  const [pic, setPic] = useState('Stage Manager');
  const [technicalCue, setTechnicalCue] = useState('Standby on stage left');
  const [audioCue, setAudioCue] = useState('Recall Scene 05 - Main Vocal FX');
  const [lightingCue, setLightingCue] = useState('Cue 12: Warm Amber wash, blinders ready');
  const [videoCue, setVideoCue] = useState('Visual Loop Track 03 (4K sync)');
  const [specialEffect, setSpecialEffect] = useState('CO2 Jets on final chorus');
  const [notes, setNotes] = useState('');

  const sortedRundown = [...rundown].sort((a, b) => a.order - b.order);

  const filteredItems = filterArea === 'ALL'
    ? sortedRundown
    : sortedRundown.filter((r) => r.venueArea === filterArea);

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedRundown.length) return;

    const newOrder = [...sortedRundown];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onReorderRundown(newOrder.map((it) => it.id));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segment.trim()) return;

    onCreateRundownItem({
      eventId: event.id,
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

    setIsModalOpen(false);
    setSegment('');
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Master Production Rundown & Technical Cue Sheet
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage direction, synchronized cues for audio engineer, lighting designer, visual jockey, and pyrotechnics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Cue Sheet</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rundown Segment</span>
          </button>
        </div>
      </div>

      {/* Cue Sheet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 w-28">Time & Dur</th>
                <th className="py-3 px-4">Segment & Talent</th>
                <th className="py-3 px-3">Area & PIC</th>
                <th className="py-3 px-4">Audio Cue (FOH)</th>
                <th className="py-3 px-4">Lighting Cue</th>
                <th className="py-3 px-4">Video & SFX</th>
                <th className="py-3 px-3 text-right">Reorder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                    {r.order}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-indigo-300 text-sm">{r.time}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.duration} menit</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100 text-xs">{r.segment}</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span>{r.talent}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-medium">{r.venueArea}</div>
                    <div className="text-[10px] text-slate-400">PIC: {r.pic}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-start gap-1.5 text-slate-300">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] font-mono">{r.audioCue || '-'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-start gap-1.5 text-slate-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] font-mono">{r.lightingCue || '-'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 space-y-1">
                    {r.videoCue && (
                      <div className="flex items-start gap-1.5 text-slate-300">
                        <Tv className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] font-mono">{r.videoCue}</span>
                      </div>
                    )}
                    {r.specialEffect && (
                      <div className="flex items-start gap-1.5 text-slate-300">
                        <Flame className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] font-mono text-rose-300">{r.specialEffect}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, 'UP')}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === sortedRundown.length - 1}
                        onClick={() => moveItem(idx, 'DOWN')}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rundown Item Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Rundown Segment & Cues</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Start Time (WIB)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Segment Title *</label>
                <input
                  type="text"
                  required
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="e.g. Sheila On 7 Main Set Live"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Talent / Performer</label>
                  <input
                    type="text"
                    value={talent}
                    onChange={(e) => setTalent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Venue Area / Stage</label>
                  <input
                    type="text"
                    value={venueArea}
                    onChange={(e) => setVenueArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Audio FOH Cue</label>
                <input
                  type="text"
                  value={audioCue}
                  onChange={(e) => setAudioCue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Lighting Cue</label>
                <input
                  type="text"
                  value={lightingCue}
                  onChange={(e) => setLightingCue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Video Cue</label>
                  <input
                    type="text"
                    value={videoCue}
                    onChange={(e) => setVideoCue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Special Effects (SFX)</label>
                  <input
                    type="text"
                    value={specialEffect}
                    onChange={(e) => setSpecialEffect(e.target.value)}
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
                  Save Rundown Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
