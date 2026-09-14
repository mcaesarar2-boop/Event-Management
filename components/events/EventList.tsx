'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Event, EventStatus, EventType } from '@/lib/types';
import { formatCompactIDR, formatDate } from '@/lib/utils/format';

interface EventListProps {
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteEvent?: (eventId: string) => void;
  onClearAllEvents?: () => void;
  onResetToOneSampleEvent?: () => void;
}

export function EventList({
  events,
  onSelectEvent,
  onOpenCreateModal,
  onDeleteEvent,
  onClearAllEvents,
  onResetToOneSampleEvent,
}: EventListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || e.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Events Portfolio Directory
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
              {events.length} Event
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola siklus hidup event mulai dari Proposal & Budgeting hingga Hari-H dan Settlement
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {events.length > 0 && onClearAllEvents && (
            <button
              onClick={() => {
                if (window.confirm('Kosongkan semua data event? Anda dapat memuat ulang 1 data contoh kapan saja.')) {
                  onClearAllEvents();
                }
              }}
              title="Bersihkan semua event agar murni kosong"
              className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Data</span>
            </button>
          )}

          {onResetToOneSampleEvent && (
            <button
              onClick={onResetToOneSampleEvent}
              title="Reset ke 1 data contoh lengkap"
              className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>{events.length === 0 ? 'Muat 1 Event Contoh' : 'Reset ke 1 Contoh'}</span>
            </button>
          )}

          <button
            id="btn-create-event-main"
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search event name, code, venue, client..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PRE_PRODUCTION">Pre-Production</option>
            <option value="PRODUCTION">Production</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="Concert">Concert</option>
            <option value="Festival">Festival</option>
            <option value="University Festival">University Festival</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Conference">Conference</option>
            <option value="Brand Activation">Brand Activation</option>
            <option value="Government Event">Government Event</option>
          </select>
        </div>
      </div>

      {/* Grid of Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((evt) => {
          const isOverBudget = evt.actualCost > evt.totalBudget;
          const grossProfit = evt.actualRevenue - evt.actualCost;
          const profitMargin = evt.actualRevenue > 0 ? ((grossProfit / evt.actualRevenue) * 100).toFixed(0) : '0';

          return (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt.id)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-600/60 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-indigo-950/40 relative overflow-hidden"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/80 font-semibold">
                    {evt.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        evt.status === 'LIVE'
                          ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                          : evt.status === 'PRODUCTION'
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                          : evt.status === 'CONFIRMED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>

                    {onDeleteEvent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmDeleteId === evt.id) {
                            onDeleteEvent(evt.id);
                            setConfirmDeleteId(null);
                          } else {
                            setConfirmDeleteId(evt.id);
                            setTimeout(() => setConfirmDeleteId(null), 3500);
                          }
                        }}
                        className={`p-1 rounded transition text-xs ${
                          confirmDeleteId === evt.id
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={confirmDeleteId === evt.id ? 'Klik lagi untuk konfirmasi hapus' : 'Hapus Event'}
                      >
                        {confirmDeleteId === evt.id ? (
                          <span className="text-[10px] px-1 font-bold">Hapus?</span>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition mt-2 leading-snug line-clamp-2">
                  {evt.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
              </div>

              {/* Event Attributes */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">
                    {formatDate(evt.eventDayDate || evt.startDate)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>{evt.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{evt.venueName}, {evt.city}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Target: {evt.expectedAttendance.toLocaleString()} attendees</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 -mx-5 -mb-5 p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Budget
                  </div>
                  <div className="text-sm font-bold text-slate-100">{formatCompactIDR(evt.totalBudget)}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Est. Margin
                  </div>
                  <div className="text-sm font-bold text-emerald-400">+{profitMargin}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl max-w-lg mx-auto p-6">
          <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">
            {events.length === 0 ? 'Portofolio Event Kosong (Bersih)' : 'Tidak ada event yang sesuai pencarian'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {events.length === 0
              ? 'Data dummy telah dibersihkan. Anda dapat membuat event baru dari awal atau memuat 1 data contoh sebagai acuan.'
              : 'Coba ubah kata kunci pencarian atau reset filter status.'}
          </p>

          {events.length === 0 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Event Baru</span>
              </button>
              {onResetToOneSampleEvent && (
                <button
                  onClick={onResetToOneSampleEvent}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Muat 1 Data Contoh</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
