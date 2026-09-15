'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Tag,
  Sparkles,
} from 'lucide-react';
import { MilestoneTag } from '@/lib/types';
import {
  COLOR_PALETTES,
  COLOR_PALETTE_LIST,
  getMilestoneColorClasses,
} from '@/lib/utils/timelineColors';

interface MilestoneTagSelectorProps {
  selectedTagId?: string;
  selectedTagLabel?: string;
  selectedTagColor?: string;
  availableTags: MilestoneTag[];
  onSelectTag: (tag: MilestoneTag) => void;
  onCreateTag: (tag: Omit<MilestoneTag, 'id'>) => MilestoneTag;
  onUpdateTag: (id: string, data: Partial<MilestoneTag>) => void;
  onDeleteTag: (id: string) => void;
}

export function MilestoneTagSelector({
  selectedTagId,
  selectedTagLabel,
  selectedTagColor,
  availableTags,
  onSelectTag,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: MilestoneTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Create Form State
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('indigo');

  // Edit Form State
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('indigo');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setEditingTagId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find active tag or derive style
  const currentTag = availableTags.find(
    (t) => t.id === selectedTagId || (selectedTagLabel && t.label.toLowerCase() === selectedTagLabel.toLowerCase())
  );
  const activeColor = currentTag?.color || selectedTagColor || 'indigo';
  const activeLabel = currentTag?.label || selectedTagLabel || 'Pilih Label';
  const style = getMilestoneColorClasses(activeColor);

  const handleStartCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreating(true);
    setEditingTagId(null);
    setNewLabel('');
    setNewColor('indigo');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newLabel.trim()) return;

    const created = onCreateTag({
      label: newLabel.trim(),
      color: newColor,
    });
    onSelectTag(created);
    setIsCreating(false);
    setIsOpen(false);
  };

  const handleStartEdit = (e: React.MouseEvent, tag: MilestoneTag) => {
    e.stopPropagation();
    setEditingTagId(tag.id);
    setIsCreating(false);
    setEditLabel(tag.label);
    setEditColor(tag.color);
  };

  const handleSaveEdit = (e: React.FormEvent, tagId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editLabel.trim()) return;

    onUpdateTag(tagId, {
      label: editLabel.trim(),
      color: editColor,
    });
    setEditingTagId(null);
  };

  const handleDelete = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    onDeleteTag(tagId);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition shadow-sm hover:brightness-110 ${style.pillBg} ${style.pillText} ${style.pillBorder}`}
      >
        <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
        <span className="truncate max-w-[130px]">{activeLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-3 py-2 bg-slate-950/80 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>Label / Kategori Milestone</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCreating(false);
                setEditingTagId(null);
              }}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Tags List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
            {availableTags.map((tag) => {
              const isSelected = tag.id === currentTag?.id;
              const tagStyle = getMilestoneColorClasses(tag.color);
              const isEditing = editingTagId === tag.id;

              if (isEditing) {
                return (
                  <form
                    key={tag.id}
                    onSubmit={(e) => handleSaveEdit(e, tag.id)}
                    className="p-2 bg-slate-950 rounded-lg border border-indigo-700/60 space-y-2"
                  >
                    <div className="text-[10px] font-bold text-indigo-300">Edit Label</div>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Nama label..."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    {/* Color palette selector */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {COLOR_PALETTE_LIST.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setEditColor(c.id)}
                          title={c.name}
                          className={`w-5 h-5 rounded-full ${c.previewBg} flex items-center justify-center transition ${
                            editColor === c.id ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950 scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {editColor === c.id && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingTagId(null)}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-0.5 text-[10px] rounded bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={tag.id}
                  onClick={() => {
                    onSelectTag(tag);
                    setIsOpen(false);
                  }}
                  className={`w-full group flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition ${
                    isSelected ? 'bg-slate-800/90 text-white' : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${tagStyle.dot} shrink-0`} />
                    <span className="truncate font-medium">{tag.label}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(e, tag)}
                      title="Edit label & warna"
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {!tag.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, tag.id)}
                        title="Hapus label kustom"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Tag Section */}
          <div className="p-2 bg-slate-950/60">
            {isCreating ? (
              <form onSubmit={handleSaveCreate} className="space-y-2">
                <div className="text-[10px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Buat Label Baru</span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nama label (contoh: Press Conf)"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                {/* 8 Color Palettes */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-400">Pilih Warna:</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_PALETTE_LIST.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewColor(c.id)}
                        title={c.name}
                        className={`w-5 h-5 rounded-full ${c.previewBg} flex items-center justify-center transition ${
                          newColor === c.id ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {newColor === c.id && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 text-[10px] rounded bg-slate-800 text-slate-400 hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!newLabel.trim()}
                    className="px-3 py-1 text-[10px] rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 transition shadow"
                  >
                    + Tambahkan
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full py-1.5 px-2 rounded-lg border border-dashed border-slate-800 hover:border-indigo-600/60 bg-slate-900/40 hover:bg-indigo-950/30 text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Label / Kategori Baru</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

