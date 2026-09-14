'use client';

import React, { useState, useMemo } from 'react';
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
  Filter,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Car,
  FileText,
} from 'lucide-react';
import { Venue, Event } from '@/lib/types';
import { formatIDR } from '@/lib/utils/format';

interface MasterVenuesViewProps {
  venues: Venue[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateVenue?: (venue: Omit<Venue, 'id'>) => void;
  onUpdateVenue?: (id: string, venue: Partial<Venue>) => void;
  onDeleteVenue?: (id: string) => void;
}

const VENUE_TYPES: ('Indoor' | 'Outdoor' | 'Hybrid')[] = ['Indoor', 'Outdoor', 'Hybrid'];

export function MasterVenuesView({
  venues,
  events,
  onSelectEvent,
  onCreateVenue,
  onUpdateVenue,
  onDeleteVenue,
}: MasterVenuesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venues[0] || null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Indoor' | 'Outdoor' | 'Hybrid'>('Outdoor');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState<number>(20000);
  const [powerCapacity, setPowerCapacity] = useState('');
  const [loadingAreaSpecs, setLoadingAreaSpecs] = useState('');
  const [curfewTime, setCurfewTime] = useState('23:00 WIB');
  const [rentalCost, setRentalCost] = useState<number>(150000000);
  const [parkingCapacity, setParkingCapacity] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [notes, setNotes] = useState('');

  const types = ['ALL', ...VENUE_TYPES];

  const resetForm = () => {
    setName('');
    setType('Outdoor');
    setCity('Jakarta Pusat');
    setAddress('');
    setCapacity(20000);
    setPowerCapacity('PLN 197 kVA + Genset 3x 250 kVA Synchronized');
    setLoadingAreaSpecs('Gate Barat 6m x 5m direct ramp access stage');
    setCurfewTime('23:00 WIB');
    setRentalCost(150000000);
    setParkingCapacity('1.500 Mobil & 5.000 Motor');
    setContactPerson('Biro Pengelola Venue');
    setContactPhone('+62 812-0000-1122');
    setRestrictions('Batas SPL FOH 105 dB(A), tidak diperbolehkan kembang api tanpa izin Damkar.');
    setNotes('');
    setEditingVenue(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (venue: Venue, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingVenue(venue);
    setName(venue.name || '');
    setType(venue.type || 'Outdoor');
    setCity(venue.city || '');
    setAddress(venue.address || '');
    setCapacity(venue.capacity || 0);
    setPowerCapacity(venue.powerCapacity || 'PLN 197 kVA');
    setLoadingAreaSpecs(venue.loadingAreaSpecs || 'Direct ramp access');
    setCurfewTime(venue.curfewTime || '23:00 WIB');
    setRentalCost(venue.rentalCost || 0);
    setParkingCapacity(venue.parkingCapacity || '1.000 Kendaraan');
    setContactPerson(venue.contactPerson || '');
    setContactPhone(venue.contactPhone || '');
    setRestrictions(venue.restrictions || '');
    setNotes(venue.notes || '');
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (venue: Venue, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingVenue(venue);
  };

  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      alert('Nama venue dan kota wajib diisi.');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      city: city.trim(),
      address: address.trim() || city.trim(),
      capacity: Number(capacity) || 0,
      powerCapacity: powerCapacity.trim() || 'PLN 100 kVA',
      loadingAreaSpecs: loadingAreaSpecs.trim() || 'Standard loading dock',
      curfewTime: curfewTime.trim() || '23:00 WIB',
      rentalCost: Number(rentalCost) || 0,
      parkingCapacity: parkingCapacity.trim() || '500 Kendaraan',
      contactPerson: contactPerson.trim() || 'Manajemen Venue',
      contactPhone: contactPhone.trim() || '+62 811-0000-0000',
      restrictions: restrictions.trim(),
      notes: notes.trim(),
    };

    if (editingVenue) {
      if (onUpdateVenue) {
        onUpdateVenue(editingVenue.id, payload);
      }
      if (selectedVenue?.id === editingVenue.id) {
        setSelectedVenue({ ...editingVenue, ...payload } as Venue);
      }
    } else {
      if (onCreateVenue) {
        onCreateVenue(payload);
      }
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingVenue) return;
    if (onDeleteVenue) {
      onDeleteVenue(deletingVenue.id);
    }
    if (selectedVenue?.id === deletingVenue.id) {
      setSelectedVenue(venues.find((v) => v.id !== deletingVenue.id) || null);
    }
    setDeletingVenue(null);
  };

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchesType = typeFilter === 'ALL' || v.type === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        (v.address && v.address.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [venues, typeFilter, searchQuery]);

  const totalCapacity = venues.reduce((sum, v) => sum + (v.capacity || 0), 0);

  const eventsLinkedToSelected = useMemo(() => {
    if (!selectedVenue) return [];
    return events.filter((e) => e.venueId === selectedVenue.id || e.venueName === selectedVenue.name);
  }, [selectedVenue, events]);

  const eventsLinkedToDeleting = useMemo(() => {
    if (!deletingVenue) return [];
    return events.filter((e) => e.venueId === deletingVenue.id || e.venueName === deletingVenue.name);
  }, [deletingVenue, events]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            VENUE & INFRASTRUCTURE DIRECTORY
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Venues & Stadiums Directory</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Database spesifikasi teknis venue konser: kapasitas penonton, daya listrik PLN/genset, area loading dock, dan jam malam (curfew).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl hidden sm:inline-block">
            <span className="font-bold text-white">{venues.length}</span> Venue Terdaftar
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Venue Baru</span>
          </button>
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
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {totalCapacity.toLocaleString('id-ID')} Pax
          </div>
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
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama venue, kota, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {types.map((typ) => (
            <button
              key={typ}
              onClick={() => setTypeFilter(typ)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                typeFilter === typ
                  ? 'bg-indigo-600 text-white shadow'
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
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm relative ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="pr-2">
                    <div className="font-bold text-white text-base leading-tight">{venue.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{venue.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/40">
                      {venue.type}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleOpenEditModal(venue, e)}
                        title="Edit Venue"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDeleteModal(venue, e)}
                        title="Hapus Venue"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
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
                    <span className="font-mono text-slate-200 truncate max-w-[170px]">{venue.powerCapacity}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      Loading Dock:
                    </span>
                    <span className="text-slate-200 truncate max-w-[170px]">{venue.loadingAreaSpecs}</span>
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

      {/* Selected Venue Detail Drawer */}
      {selectedVenue && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                DETAIL SPESIFIKASI & INFRASTRUKTUR VENUE
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {selectedVenue.name}
                <span className="text-xs font-normal px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  {selectedVenue.type}
                </span>
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  {selectedVenue.capacity.toLocaleString('id-ID')} Pax
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="font-mono text-emerald-400 font-bold text-base bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 mr-2">
                Sewa: {formatIDR(selectedVenue.rentalCost)}
              </div>
              <button
                onClick={() => handleOpenEditModal(selectedVenue)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Venue
              </button>
              <button
                onClick={() => handleOpenDeleteModal(selectedVenue)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            {/* Teknis Listrik & Loading Dock */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <Zap className="w-3.5 h-3.5" />
                Daya Listrik & Loading Ramp
              </div>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">Kapasitas Listrik:</span> {selectedVenue.powerCapacity}</p>
                <p><span className="text-slate-500">Akses Loading Dock:</span> {selectedVenue.loadingAreaSpecs}</p>
                <p><span className="text-slate-500">Kapasitas Parkir:</span> {selectedVenue.parkingCapacity || 'Tersedia parkir kendaraan'}</p>
              </div>
            </div>

            {/* Lokasi & Kontak Pengelola */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                Alamat & Pengelola Venue
              </div>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">Kota:</span> {selectedVenue.city}</p>
                <p><span className="text-slate-500">Alamat:</span> {selectedVenue.address}</p>
                <p><span className="text-slate-500">PIC / Pengelola:</span> {selectedVenue.contactPerson || 'Manajemen Venue'} ({selectedVenue.contactPhone || '-'})</p>
              </div>
            </div>

            {/* Jam Malam & Batasan Kebisingan */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-rose-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                Curfew & Regulasi Khusus
              </div>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">Batas Jam Malam:</span> <span className="font-mono text-rose-300 font-semibold">{selectedVenue.curfewTime}</span></p>
                <p><span className="text-slate-500">Batasan SPL / Notes:</span> {selectedVenue.restrictions || 'Sesuai regulasi kepolisian daerah.'}</p>
              </div>
            </div>
          </div>

          {/* Event yang terdaftar di venue ini */}
          {eventsLinkedToSelected.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-white mb-2">
                Event yang Dijadwalkan di Venue Ini ({eventsLinkedToSelected.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eventsLinkedToSelected.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 cursor-pointer transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{ev.name}</div>
                      <div className="text-[10px] text-slate-400">{ev.code} • {ev.status}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: FORM CREATE / EDIT VENUE */}
      {isFormModalOpen && (
        <div
          onClick={() => setIsFormModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden cursor-default my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingVenue ? 'Edit Data Venue & Fasilitas' : 'Tambah Venue Konser Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingVenue
                      ? `Perbarui spesifikasi teknis dan daya listrik untuk ${editingVenue.name}`
                      : 'Lengkapi identitas lokasi, kapasitas penonton, daya PLN, dan curfew'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveVenue} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Identitas & Lokasi */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Identitas & Lokasi Venue</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Nama Venue / Stadion / Hall *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Stadion Mandala Krida / Indonesia Arena GBK"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tipe Venue *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'Indoor' | 'Outdoor' | 'Hybrid')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {VENUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Kota / Wilayah *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Jakarta Pusat / Yogyakarta"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Alamat Lengkap Venue</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jl. Pintu Satu Senayan, Gelora, Tanah Abang, Jakarta Pusat"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Kapasitas & Spesifikasi Teknis */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>2. Kapasitas & Spesifikasi Teknis Lapangan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Kapasitas Maksimal Audiens (Pax) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Kapasitas Area Parkir</label>
                    <input
                      type="text"
                      value={parkingCapacity}
                      onChange={(e) => setParkingCapacity(e.target.value)}
                      placeholder="1.500 Mobil & 5.000 Motor"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Daya Listrik (PLN & Backup Genset)</label>
                    <input
                      type="text"
                      value={powerCapacity}
                      onChange={(e) => setPowerCapacity(e.target.value)}
                      placeholder="PLN 197 kVA + Genset 3x 250 kVA Synchronized"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Spesifikasi Akses Loading Dock Ramp</label>
                    <input
                      type="text"
                      value={loadingAreaSpecs}
                      onChange={(e) => setLoadingAreaSpecs(e.target.value)}
                      placeholder="Gate Barat 6m x 5m direct ramp access stage"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Operasional & Biaya Sewa */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>3. Operasional, Curfew & Biaya Sewa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Batas Jam Malam (Curfew)</label>
                    <input
                      type="text"
                      value={curfewTime}
                      onChange={(e) => setCurfewTime(e.target.value)}
                      placeholder="23:00 WIB"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-rose-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tarif Sewa Venue (IDR)</label>
                    <input
                      type="number"
                      step="5000000"
                      value={rentalCost}
                      onChange={(e) => setRentalCost(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(rentalCost || 0)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">PIC / Pengelola Venue</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Biro Pengelola Venue Senayan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">No. Kontak Pengelola</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+62 21-573-4070"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Batasan Kebisingan & Aturan Khusus</label>
                    <textarea
                      rows={2}
                      value={restrictions}
                      onChange={(e) => setRestrictions(e.target.value)}
                      placeholder="Batas SPL FOH 105 dB(A), kembang api membutuhkan izin Damkar dan Kepolisian."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingVenue ? 'Simpan Perubahan Venue' : 'Tambah Venue ke Direktori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingVenue && (
        <div
          onClick={() => setDeletingVenue(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden cursor-default p-6 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Hapus Lokasi Venue?</h3>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus venue <span className="font-bold text-rose-300">{deletingVenue.name}</span> dari direktori master?
              </p>
            </div>

            {eventsLinkedToDeleting.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3 rounded-xl text-left space-y-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Perhatian: Venue Terbooking Oleh Event!
                </div>
                <div className="text-[11px] text-slate-300">
                  Venue ini terhubung dengan <span className="font-bold">{eventsLinkedToDeleting.length} event</span> aktif:
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-200/90 pl-1 space-y-0.5">
                  {eventsLinkedToDeleting.slice(0, 3).map((ev) => (
                    <li key={ev.id} className="truncate">{ev.name}</li>
                  ))}
                  {eventsLinkedToDeleting.length > 3 && (
                    <li>dan {eventsLinkedToDeleting.length - 3} event lainnya...</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVenue(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Hapus Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
