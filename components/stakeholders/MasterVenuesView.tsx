'use client';

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Zap,
  Truck,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Venue, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface MasterVenuesViewProps {
  venues: Venue[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateVenue?: (venue: Omit<Venue, 'id'>) => void;
}

export function MasterVenuesView({
  venues,
  events,
  onSelectEvent,
}: MasterVenuesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venues[0] || null);

  const types = ['ALL', 'Indoor', 'Outdoor', 'Hybrid'];

  const filteredVenues = venues.filter((v) => {
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCapacity = venues.reduce((sum, v) => sum + (v.capacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            VENUE & INFRASTRUCTURE DIRECTORY
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Venues & Stadiums Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Database spesifikasi teknis venue konser: kapasitas penonton, daya listrik PLN/genset, area loading dock, dan jam malam (curfew).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            {venues.length} Venue Terdaftar
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Venue Tersedia</div>
          <div className="text-2xl font-bold text-white font-mono">{venues.length} Lokasi</div>
          <div className="text-xs text-indigo-400 mt-1">Stadion, Convention Hall, Park Outdoor</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Kapasitas Maksimal Akumulatif</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{totalCapacity.toLocaleString('id-ID')} Pax</div>
          <div className="text-xs text-slate-400 mt-1">Total Daya Tampung Audiens</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Event Aktif Menggunakan Venue</div>
          <div className="text-2xl font-bold text-sky-400 font-mono">{events.length} Event Terbooking</div>
          <div className="text-xs text-slate-400 mt-1">Status Sewa & Perizinan Berjalan</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama venue, kota, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {types.map((typ) => (
            <button
              key={typ}
              onClick={() => setTypeFilter(typ)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                typeFilter === typ
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {typ === 'ALL' ? 'Semua Tipe' : typ}
            </button>
          ))}
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((venue) => {
          const venueEvents = events.filter((e) => e.venueId === venue.id || e.venueName === venue.name);
          const isSelected = selectedVenue?.id === venue.id;

          return (
            <div
              key={venue.id}
              onClick={() => setSelectedVenue(venue)}
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-base leading-tight">{venue.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {venue.city}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/40">
                    {venue.type}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Kapasitas:
                    </span>
                    <span className="font-mono font-bold text-white">
                      {venue.capacity.toLocaleString('id-ID')} pax
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Daya Listrik:
                    </span>
                    <span className="font-mono text-slate-200">{venue.powerCapacity}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      Loading Dock:
                    </span>
                    <span className="text-slate-200 truncate max-w-[150px]">{venue.loadingAreaSpecs}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      Batas Jam (Curfew):
                    </span>
                    <span className="text-rose-300 font-mono">{venue.curfewTime}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Tarif Sewa Venue:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatIDR(venue.rentalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Event Associations */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Event Terjadwal:</span>
                  <span className="font-mono text-indigo-300 font-semibold">{venueEvents.length} Event</span>
                </div>
                {venueEvents.length > 0 && (
                  <div className="space-y-1">
                    {venueEvents.slice(0, 1).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev.id);
                        }}
                        className="flex items-center justify-between p-1.5 rounded bg-slate-950 hover:bg-indigo-950/40 border border-slate-800/60 text-xs text-slate-300 hover:text-white transition group"
                      >
                        <span className="truncate font-medium">{ev.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
