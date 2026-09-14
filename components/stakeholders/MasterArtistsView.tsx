'use client';

import React, { useState } from 'react';
import {
  Music,
  Plus,
  Users,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Coffee,
  Sliders,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Artist, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface MasterArtistsViewProps {
  artists: Artist[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onAddArtist?: (artist: Omit<Artist, 'id'>) => void;
}

export function MasterArtistsView({
  artists,
  events,
  onSelectEvent,
}: MasterArtistsViewProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(artists[0] || null);

  const types = ['ALL', 'Headliner', 'Co-Headliner', 'Supporting Act', 'Opening Act', 'Guest Star'];

  const filteredArtists = artists.filter((a) => {
    const matchesType = selectedType === 'ALL' || a.type === selectedType;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.agency?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalArtistFees = artists.reduce((sum, a) => sum + (a.fee || 0), 0);
  const totalHeadliners = artists.filter((a) => a.type === 'Headliner').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Music className="w-4 h-4" />
            STAKEHOLDERS & TALENT MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Artists Roster & Riders Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manajemen artis, kontrak fee booking, verifikasi technical rider (channel list/backline), serta hospitality & hotel rider.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            {artists.length} Lineup Artis Terdaftar
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Artis Terjadwal</div>
          <div className="text-2xl font-bold text-white font-mono">{artists.length} Artis / Band</div>
          <div className="text-xs text-indigo-400 mt-1">{totalHeadliners} Main Headliners</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Komitmen Honorarium Artis</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{formatIDR(totalArtistFees)}</div>
          <div className="text-xs text-slate-400 mt-1">Kontrak Fee Booking & Performance</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Technical Rider Signed</div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {artists.filter((a) => a.technicalRider?.stagePlotAttached).length} / {artists.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Stage Plot & Input Channel Siap</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Cari artis, genre, atau management..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {types.map((typ) => (
            <button
              key={typ}
              onClick={() => setSelectedType(typ)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedType === typ
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {typ === 'ALL' ? 'Semua Tipe' : typ}
            </button>
          ))}
        </div>
      </div>

      {/* Artists Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => {
          const ev = events.find((e) => e.id === artist.eventId);
          const isSelected = selectedArtist?.id === artist.id;

          return (
            <div
              key={artist.id}
              onClick={() => setSelectedArtist(artist)}
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-base leading-tight">{artist.name}</div>
                    <div className="text-xs text-indigo-400 mt-0.5">{artist.genre}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    artist.type === 'Headliner'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {artist.type}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Event:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[170px]">{ev?.name || 'All'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Performance Fee:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatIDR(artist.fee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Management:</span>
                    <span className="text-slate-300">{artist.agency || 'Indie Management'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status Booking:</span>
                    <span className="text-sky-400 font-semibold">{artist.bookingStatus || 'Confirmed'}</span>
                  </div>
                </div>

                {/* Rider Checklist mini pills */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    Tech Rider
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                    <Coffee className="w-3 h-3 text-amber-400" />
                    Hospitality
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Klik untuk melihat rider</span>
                {ev && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(ev.id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                  >
                    Buka Event
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Artist Rider Drawer Detail */}
      {selectedArtist && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase">DETAIL RIDER ARTIS TERPILIH</div>
              <h2 className="text-lg font-bold text-white">{selectedArtist.name} ({selectedArtist.type})</h2>
            </div>
            <div className="font-mono text-emerald-400 font-bold text-base">
              Fee: {formatIDR(selectedArtist.fee)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            {/* Technical Rider Spec */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Spesifikasi Technical Rider & Panggung
              </div>
              <p className="text-slate-400">
                {selectedArtist.technicalRider?.audioRequirement || 'FOH Digital Console Avid S6L / DiGiCo SD12, 12 Monitor Mix IEM Sennheiser G4.'}
              </p>
              <div className="pt-2 text-slate-300 font-mono text-[11px]">
                Stage Plot: {selectedArtist.technicalRider?.stagePlotAttached ? '✓ Stage plot & channel list terlampir' : 'Dalam proses konfirmasi teknis'}
              </div>
            </div>

            {/* Hospitality Rider Spec */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                Hospitality, Hotel & Ruang Tunggu
              </div>
              <p className="text-slate-400">
                {selectedArtist.hospitalityRider?.dressingRooms || '1 Ruang VIP AC dingin, 2 Van Toyota Alphard, 10 Kartu VIP All Access.'}
              </p>
              <div className="pt-2 text-slate-300 font-mono text-[11px]">
                Hotel: {selectedArtist.hospitalityRider?.hotelRequirement || 'Hotel Bintang 5 Dekat Venue (1 Suite + 4 Deluxe Room)'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
