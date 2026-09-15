'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { MilestoneTag, ProductionMilestone } from '@/lib/types';
import {
  DEFAULT_MILESTONE_TAGS,
  generateStandardMilestones,
  getMilestoneColorClasses,
} from '@/lib/utils/timelineColors';
import { MilestoneTagSelector } from './MilestoneTagSelector';

interface ProductionTimelineTableProps {
  milestones: ProductionMilestone[];
  onChangeMilestones: (milestones: ProductionMilestone[]) => void;
  referenceShowDay?: string;
  onReferenceShowDayChange?: (date: string) => void;
  availableTags?: MilestoneTag[];
  onTagsChange?: (tags: MilestoneTag[]) => void;
}

export function ProductionTimelineTable({
  milestones,
  onChangeMilestones,
  referenceShowDay,
  onReferenceShowDayChange,
  availableTags: initialTags,
  onTagsChange,
}: ProductionTimelineTableProps) {
  // Tags State
  const [tags, setTags] = useState<MilestoneTag[]>(initialTags || DEFAULT_MILESTONE_TAGS);

  // Sync external tags if provided
  useEffect(() => {
    if (initialTags && initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const updateTags = (newTags: MilestoneTag[]) => {
    setTags(newTags);
    if (onTagsChange) onTagsChange(newTags);
  };

  // Tag CRUD Handlers
  const handleCreateTag = (newTagData: Omit<MilestoneTag, 'id'>): MilestoneTag => {
    const newTag: MilestoneTag = {
      ...newTagData,
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    const nextTags = [...tags, newTag];
    updateTags(nextTags);
    return newTag;
  };

  const handleUpdateTag = (id: string, data: Partial<MilestoneTag>) => {
    const nextTags = tags.map((t) => (t.id === id ? { ...t, ...data } : t));
    updateTags(nextTags);

    // Also update any milestones referencing this tag
    const updatedMilestones = milestones.map((m) => {
      if (m.tagId === id) {
        return {
          ...m,
          tagLabel: data.label !== undefined ? data.label : m.tagLabel,
          tagColor: data.color !== undefined ? data.color : m.tagColor,
        };
      }
      return m;
    });
    onChangeMilestones(updatedMilestones);
  };

  const handleDeleteTag = (id: string) => {
    const nextTags = tags.filter((t) => t.id !== id);
    updateTags(nextTags);
  };

  // Reference Show Day Date
  const defaultBaseDate = useMemo(() => {
    if (referenceShowDay) return referenceShowDay;
    const showDayMilestone = milestones.find(
      (m) => m.tagLabel?.toLowerCase().includes('show') || m.category === 'SHOW_DAY'
    );
    if (showDayMilestone?.date) return showDayMilestone.date;
    if (milestones.length > 0 && milestones[0].date) return milestones[0].date;
    return new Date().toISOString().split('T')[0];
  }, [referenceShowDay, milestones]);

  const [baseDate, setBaseDate] = useState(defaultBaseDate);

  const handleBaseDateChange = (date: string) => {
    setBaseDate(date);
    if (onReferenceShowDayChange) onReferenceShowDayChange(date);
  };

  // ⚡ Generate Standard Template
  const handleGenerateTemplate = () => {
    const standard = generateStandardMilestones(baseDate, tags);
    onChangeMilestones(standard);
  };

  // Row Modification Handlers
  const handleUpdateMilestone = (id: string, field: keyof ProductionMilestone, value: any) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onChangeMilestones(updated);
  };

  const handleSelectTagForRow = (milestoneId: string, tag: MilestoneTag) => {
    const updated = milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tagId: tag.id,
          tagLabel: tag.label,
          tagColor: tag.color,
        };
      }
      return m;
    });
    onChangeMilestones(updated);
  };

  const handleDeleteRow = (id: string) => {
    onChangeMilestones(milestones.filter((m) => m.id !== id));
  };

  // Insert Row In-Between
  const handleInsertRowAt = (index: number) => {
    const prevItem = milestones[index - 1];
    const nextItem = milestones[index];

    let targetDate = baseDate;
    if (prevItem) {
      targetDate = prevItem.date;
    } else if (nextItem) {
      targetDate = nextItem.date;
    }

    const defaultTag = tags.find((t) => t.color === 'purple' || t.color === 'amber') || tags[0] || DEFAULT_MILESTONE_TAGS[0];

    const newRow: ProductionMilestone = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: targetDate,
      time: '12:00',
      tagId: defaultTag.id,
      tagLabel: defaultTag.label,
      tagColor: defaultTag.color,
      title: 'Agenda baru / aktivitas spesifik produksi...',
      status: 'SCHEDULED',
    };

    const newMilestones = [...milestones];
    newMilestones.splice(index, 0, newRow);
    onChangeMilestones(newMilestones);
  };

  // Add Row at the end
  const handleAddBottomRow = () => {
    const lastItem = milestones[milestones.length - 1];
    let nextDate = baseDate;

    if (lastItem) {
      try {
        const d = new Date(lastItem.date);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + 1);
          nextDate = d.toISOString().split('T')[0];
        }
      } catch {
        nextDate = lastItem.date;
      }
    }

    const defaultTag = tags[0] || DEFAULT_MILESTONE_TAGS[0];

    const newRow: ProductionMilestone = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: nextDate,
      time: '10:00',
      tagId: defaultTag.id,
      tagLabel: defaultTag.label,
      tagColor: defaultTag.color,
      title: 'Agenda baru / aktivitas spesifik produksi...',
      status: 'SCHEDULED',
    };

    onChangeMilestones([...milestones, newRow]);
  };

  // Date span calculation
  const dateSpanInfo = useMemo(() => {
    if (milestones.length === 0) return null;
    const dates = milestones.map((m) => m.date).filter(Boolean).sort();
    if (dates.length === 0) return null;
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    let diffDays = 1;
    try {
      const d1 = new Date(minDate).getTime();
      const d2 = new Date(maxDate).getTime();
      diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 3600 * 24)) + 1);
    } catch {
      diffDays = 1;
    }

    return { minDate, maxDate, diffDays };
  }, [milestones]);

  return (
    <div className="space-y-3.5">
      {/* 1. Header Toolbar: Tanggal Acuan & Tombol Generate Standar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tanggal Acuan / Show Day Utama:</span>
            </label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => handleBaseDateChange(e.target.value)}
              className="bg-slate-950 border border-slate-750 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none"
            />
          </div>

          <div className="sm:pt-4">
            <button
              type="button"
              onClick={handleGenerateTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Generate Template Standar (D-4 s/d D+2)</span>
            </button>
          </div>
        </div>

        {/* Date span badge */}
        {dateSpanInfo && (
          <div className="text-right sm:self-center">
            <span className="text-[10px] text-slate-400 block">Rentang Produksi Otomatis:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-800/80 px-2.5 py-0.5 rounded-full mt-0.5">
              <span>{dateSpanInfo.minDate}</span>
              <span className="text-slate-500">&rarr;</span>
              <span>{dateSpanInfo.maxDate}</span>
              <span className="text-indigo-400 font-semibold">({dateSpanInfo.diffDays} Hari)</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Interactive Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center text-slate-500">#</th>
                <th className="py-2.5 px-3 w-48">Tanggal & Jam</th>
                <th className="py-2.5 px-3 w-44">Label / Kategori</th>
                <th className="py-2.5 px-3">Agenda / Aktivitas Detail ("Ngapain")</th>
                <th className="py-2.5 px-3 w-14 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {milestones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <Layers className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="font-medium text-xs">Belum ada tahapan jadwal timeline produksi.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Klik <strong>"⚡ Generate Template Standar"</strong> di atas atau tombol <strong>"+ Tambah Hari"</strong> di bawah.
                    </p>
                  </td>
                </tr>
              ) : (
                milestones.map((m, idx) => {
                  const style = getMilestoneColorClasses(m.tagColor || 'indigo');

                  return (
                    <React.Fragment key={m.id}>
                      {/* In-Between Row Insertion Hover Trigger (before item if index > 0) */}
                      {idx > 0 && (
                        <tr className="group/inserter h-0 p-0 border-0">
                          <td colSpan={5} className="p-0 relative h-0">
                            <div className="absolute inset-x-0 -top-2.5 h-5 flex items-center justify-center z-10 pointer-events-none group-hover/inserter:pointer-events-auto">
                              <button
                                type="button"
                                onClick={() => handleInsertRowAt(idx)}
                                className="opacity-0 group-hover/inserter:opacity-100 transition-all transform scale-90 group-hover/inserter:scale-100 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/50"
                              >
                                <Plus className="w-3 h-3" />
                                <span>(+) Sisipkan Jadwal di Sini</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Main Table Row */}
                      <tr className="hover:bg-slate-900/40 transition-colors group">
                        {/* 1. Row Number */}
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-bold">
                          {idx + 1}
                        </td>

                        {/* 2. Tanggal & Jam */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="date"
                              value={m.date || ''}
                              onChange={(e) => handleUpdateMilestone(m.id, 'date', e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 w-32"
                            />
                            <input
                              type="time"
                              value={m.time || '08:00'}
                              onChange={(e) => handleUpdateMilestone(m.id, 'time', e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 w-20"
                            />
                          </div>
                        </td>

                        {/* 3. Label / Kategori (Custom Tag Selector) */}
                        <td className="py-2.5 px-3">
                          <MilestoneTagSelector
                            selectedTagId={m.tagId}
                            selectedTagLabel={m.tagLabel}
                            selectedTagColor={m.tagColor}
                            availableTags={tags}
                            onSelectTag={(tag) => handleSelectTagForRow(m.id, tag)}
                            onCreateTag={handleCreateTag}
                            onUpdateTag={handleUpdateTag}
                            onDeleteTag={handleDeleteTag}
                          />
                        </td>

                        {/* 4. Agenda Detail ("Ngapain") */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={m.title || ''}
                            onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                            placeholder="Aktivitas detail (contoh: Loading dock FOH console, soundcheck headliner)..."
                            className="w-full bg-slate-900/80 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition focus:bg-slate-900"
                          />
                        </td>

                        {/* 5. Aksi */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(m.id)}
                            title="Hapus baris tahapan"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Footer Table Action */}
        <div className="p-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddBottomRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Tambah Hari / Tahapan Baru</span>
          </button>

          <span className="text-[11px] text-slate-400">
            Total {milestones.length} Tahapan Terjadwal
          </span>
        </div>
      </div>
    </div>
  );
}

