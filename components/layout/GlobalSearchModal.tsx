'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FolderKanban,
  Music,
  ShoppingBag,
  Building2,
  FileText,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { Event, Artist, Vendor, Task, DocumentItem } from '@/lib/types';
import { formatCompactIDR } from '@/lib/utils/format';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  artists: Artist[];
  vendors: Vendor[];
  tasks: Task[];
  documents: DocumentItem[];
  onSelectEvent: (eventId: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  events,
  artists,
  vendors,
  tasks,
  documents,
  onSelectEvent,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'EVENT' | 'ARTIST' | 'VENDOR' | 'TASK' | 'DOCUMENT';
      icon: any;
      eventId?: string;
      actionText: string;
    }> = [];

    // Events
    if (filterType === 'ALL' || filterType === 'EVENT') {
      events.forEach((e) => {
        if (
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.clientName.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q)
        ) {
          results.push({
            id: e.id,
            title: `${e.name} (${e.code})`,
            subtitle: `${e.type} • ${e.venueName} • Budget: ${formatCompactIDR(e.totalBudget)}`,
            category: 'EVENT',
            icon: FolderKanban,
            eventId: e.id,
            actionText: 'Open Event Dashboard',
          });
        }
      });
    }

    // Artists
    if (filterType === 'ALL' || filterType === 'ARTIST') {
      artists.forEach((a) => {
        if (
          a.name.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q) ||
          a.agency.toLowerCase().includes(q)
        ) {
          results.push({
            id: a.id,
            title: a.name,
            subtitle: `${a.type} • ${a.genre} • Fee: ${formatCompactIDR(a.fee)} • ${a.bookingStatus}`,
            category: 'ARTIST',
            icon: Music,
            eventId: a.eventId,
            actionText: 'View Artist in Event',
          });
        }
      });
    }

    // Vendors
    if (filterType === 'ALL' || filterType === 'VENDOR') {
      vendors.forEach((v) => {
        if (
          v.company.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.contactPerson.toLowerCase().includes(q)
        ) {
          results.push({
            id: v.id,
            title: v.company,
            subtitle: `${v.category} Specialist • Contact: ${v.contactPerson} (${v.phone})`,
            category: 'VENDOR',
            icon: ShoppingBag,
            actionText: 'View Vendor Profile',
          });
        }
      });
    }

    // Tasks
    if (filterType === 'ALL' || filterType === 'TASK') {
      tasks.forEach((t) => {
        if (
          t.name.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        ) {
          results.push({
            id: t.id,
            title: t.name,
            subtitle: `Assigned to ${t.assignee} • Due: ${t.dueDate} • Priority: ${t.priority}`,
            category: 'TASK',
            icon: CheckSquare,
            eventId: t.eventId,
            actionText: 'Jump to Task',
          });
        }
      });
    }

    // Documents
    if (filterType === 'ALL' || filterType === 'DOCUMENT') {
      documents.forEach((d) => {
        if (d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)) {
          results.push({
            id: d.id,
            title: d.name,
            subtitle: `${d.category} • Uploaded by ${d.uploadedBy} (${d.fileSize})`,
            category: 'DOCUMENT',
            icon: FileText,
            eventId: d.eventId,
            actionText: 'Open Document',
          });
        }
      });
    }

    return results.slice(0, 15);
  }, [query, filterType, events, artists, vendors, tasks, documents]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-input"
    >
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col cursor-default"
      >
        {/* Search Input */}
        <div className="p-3 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, artists, vendors, tasks, contracts..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 text-xs overflow-x-auto">
          {['ALL', 'EVENT', 'ARTIST', 'VENDOR', 'TASK', 'DOCUMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Results' : type}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/60">
          {query.trim() && filteredResults.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">
              No matching records found for &quot;{query}&quot;. Try searching for &quot;Sheila&quot;, &quot;UGM&quot;, &quot;SAV&quot;, or &quot;Genset&quot;.
            </div>
          )}

          {!query.trim() && (
            <div className="p-4 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300">Quick suggestions:</div>
              <div className="flex flex-wrap gap-1.5">
                {['UGM Festival', 'Sheila On 7', 'L-Acoustics', 'Citra Visual Mandiri', 'Mandala Krida', 'Genset', 'Permit'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[11px] transition"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {filteredResults.map((res) => {
            const Icon = res.icon;
            return (
              <div
                key={res.id}
                onClick={() => {
                  if (res.eventId) {
                    onSelectEvent(res.eventId);
                  }
                  onClose();
                }}
                className="p-2.5 rounded-lg hover:bg-slate-800/80 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate">
                      {res.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{res.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-2">
                  <span>{res.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
