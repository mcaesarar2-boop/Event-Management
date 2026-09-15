'use client';

import React, { useState, useMemo } from 'react';
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
  Edit2,
  Trash2,
  X,
  Search,
  Calendar,
  Building2,
} from 'lucide-react';
import { Artist, Event, ArtistType, ArtistBookingStatus, ArtistRiderGearItem } from '@/lib/types';
import { formatIDR } from '@/lib/utils/format';
import { RiderGearComboboxInput } from '@/components/events/detail/RiderGearComboboxInput';
import { normalizeArtistGearList } from '@/lib/utils/riderSync';

interface MasterArtistsViewProps {
  artists: Artist[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onAddArtist?: (artist: Omit<Artist, 'id'>) => void;
  onUpdateArtist?: (id: string, artist: Partial<Artist>) => void;
  onDeleteArtist?: (id: string) => void;
}

const ARTIST_TYPES: ArtistType[] = [
  'Headliner',
  'Supporting Artist',
  'Band',
  'DJ',
  'MC',
  'Speaker',
  'Influencer',
  'Guest',
  'Other',
];

const BOOKING_STATUSES: ArtistBookingStatus[] = [
  'Confirmed',
  'Contracted',
  'Negotiation',
  'Tentative',
  'Hold',
  'Offered',
  'Inquiry',
  'Completed',
  'Cancelled',
];

export function MasterArtistsView({
  artists,
  events,
  onSelectEvent,
  onAddArtist,
  onUpdateArtist,
  onDeleteArtist,
}: MasterArtistsViewProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(artists[0] || null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [deletingArtist, setDeletingArtist] = useState<Artist | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [type, setType] = useState<ArtistType>('Headliner');
  const [bookingStatus, setBookingStatus] = useState<ArtistBookingStatus>('Confirmed');
  const [eventId, setEventId] = useState<string>(events[0]?.id || '');
  const [agency, setAgency] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fee, setFee] = useState<number>(100000000);
  const [audioRequirement, setAudioRequirement] = useState('');
  const [gearList, setGearList] = useState<ArtistRiderGearItem[]>([]);
  const [stagePlotAttached, setStagePlotAttached] = useState(true);
  const [dressingRooms, setDressingRooms] = useState('');
  const [hotelRequirement, setHotelRequirement] = useState('');
  const [notes, setNotes] = useState('');

  const typesFilterList = ['ALL', ...ARTIST_TYPES];

  const resetForm = () => {
    setName('');
    setGenre('');
    setType('Headliner');
    setBookingStatus('Confirmed');
    setEventId(events[0]?.id || '');
    setAgency('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setFee(100000000);
    setAudioRequirement('FOH Console Avid S6L / DiGiCo SD12, IEM Sennheiser G4');
    setGearList([]);
    setStagePlotAttached(true);
    setDressingRooms('1 Ruang VIP AC dingin dengan cermin make-up dan sofa');
    setHotelRequirement('Hotel Bintang 5 Dekat Venue (1 Suite + 4 Deluxe)');
    setNotes('');
    setEditingArtist(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (artist: Artist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingArtist(artist);
    setName(artist.name || '');
    setGenre(artist.genre || '');
    setType(artist.type || 'Headliner');
    setBookingStatus(artist.bookingStatus || 'Confirmed');
    setEventId(artist.eventId || events[0]?.id || '');
    setAgency(artist.agency || artist.management || '');
    setContactPerson(artist.contactPerson || '');
    setPhone(artist.phone || '');
    setEmail(artist.email || '');
    setFee(artist.fee || 0);
    setAudioRequirement(
      artist.technicalRider?.audioRequirement ||
        'FOH Console Avid S6L / DiGiCo SD12, IEM Sennheiser G4'
    );
    setGearList(normalizeArtistGearList(artist));
    setStagePlotAttached(Boolean(artist.technicalRider?.stagePlotAttached));
    setDressingRooms(
      artist.hospitalityRider?.dressingRooms ||
        '1 Ruang VIP AC dingin dengan cermin make-up dan sofa'
    );
    setHotelRequirement(
      artist.hospitalityRider?.hotelRequirement ||
        'Hotel Bintang 5 Dekat Venue (1 Suite + 4 Deluxe)'
    );
    setNotes(artist.notes || '');
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (artist: Artist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingArtist(artist);
  };

  const handleSaveArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama artis/band wajib diisi.');
      return;
    }

    const payload = {
      name: name.trim(),
      genre: genre.trim() || 'Pop / Rock',
      type,
      bookingStatus,
      contractStatus: (bookingStatus === 'Contracted' ? 'Signed' : 'Draft') as any,
      eventId: eventId || events[0]?.id || 'evt-001',
      agency: agency.trim() || 'Indie Management',
      management: agency.trim() || 'Indie Management',
      contactPerson: contactPerson.trim() || name.trim(),
      phone: phone.trim() || '+62 811-0000-0000',
      email: email.trim() || 'management@artist.id',
      fee: Number(fee) || 0,
      notes: notes.trim(),
      technicalRider: {
        stageRequirement: 'Panggung Utama min 16m x 12m',
        audioRequirement: audioRequirement.trim() || (gearList.length > 0 ? gearList.map(g => g.name).join(', ') : 'Standard Live PA & Monitoring'),
        monitorSystem: '12 Mix Stereo IEM',
        gearList,
        backlineList: gearList.length > 0 ? gearList.map(g => g.name) : ['Drum Pearl Masters', 'Ampli Marshall JCM900', 'Ampli Ampeg SVT-CL'],
        microphoneSpec: ['Shure Axient Digital', 'Neumann KMS105'],
        lightingMood: 'Dynamic Concert & Strobe',
        videoVisualSpec: '4K LED Wall Screen 3.9mm',
        powerRequirement: '50 kVA Isolated Clean Power',
        stagePlotAttached,
        inputListAttached: true,
        notes: notes.trim(),
      },
      hospitalityRider: {
        dressingRooms: dressingRooms.trim(),
        foodAndBeverage: ['Air Mineral Suhu Ruang', 'Buah Segar', 'Kopi Hitam'],
        hotelRequirement: hotelRequirement.trim(),
        transportation: '2 Unit HiAce VIP / Alphard',
        securityDetail: '4 Orang Barricade Security Stage',
        guestListQuota: 10,
        specialRequests: [],
      },
    };

    if (editingArtist) {
      if (onUpdateArtist) {
        onUpdateArtist(editingArtist.id, payload);
      }
      if (selectedArtist?.id === editingArtist.id) {
        setSelectedArtist({ ...editingArtist, ...payload } as Artist);
      }
    } else {
      if (onAddArtist) {
        onAddArtist(payload as any);
      }
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingArtist) return;
    if (onDeleteArtist) {
      onDeleteArtist(deletingArtist.id);
    }
    if (selectedArtist?.id === deletingArtist.id) {
      setSelectedArtist(artists.find((a) => a.id !== deletingArtist.id) || null);
    }
    setDeletingArtist(null);
  };

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const matchesType = selectedType === 'ALL' || a.type === selectedType;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        (a.genre && a.genre.toLowerCase().includes(q)) ||
        (a.agency && a.agency.toLowerCase().includes(q)) ||
        (a.management && a.management.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [artists, selectedType, searchQuery]);

  const totalArtistFees = artists.reduce((sum, a) => sum + (a.fee || 0), 0);
  const totalHeadliners = artists.filter((a) => a.type === 'Headliner').length;

  const eventLinkedToSelected = events.find((e) => e.id === selectedArtist?.eventId);
  const eventLinkedToDeleting = events.find((e) => e.id === deletingArtist?.eventId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Music className="w-4 h-4" />
            STAKEHOLDERS & TALENT MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Artists Roster & Riders Hub</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manajemen artis, kontrak fee booking, verifikasi technical rider (channel list/backline), serta hospitality & hotel rider.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl hidden sm:inline-block">
            <span className="font-bold text-white">{artists.length}</span> Lineup Artis Terdaftar
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Artis / Band</span>
          </button>
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
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari artis, genre, atau management..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {typesFilterList.map((typ) => (
            <button
              key={typ}
              onClick={() => setSelectedType(typ)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedType === typ
                  ? 'bg-indigo-600 text-white shadow'
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
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm relative ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="pr-2">
                    <div className="font-bold text-white text-base leading-tight">{artist.name}</div>
                    <div className="text-xs text-indigo-400 mt-0.5 font-medium">{artist.genre}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                        artist.type === 'Headliner'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {artist.type}
                    </span>

                    {/* Action buttons on card */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleOpenEditModal(artist, e)}
                        title="Edit Artis"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDeleteModal(artist, e)}
                        title="Hapus Artis"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Event:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[170px]">
                      {ev?.name || 'All Events'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Performance Fee:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatIDR(artist.fee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Management:</span>
                    <span className="text-slate-300 truncate max-w-[160px]">{artist.agency || artist.management || 'Indie'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status Booking:</span>
                    <span className="text-sky-400 font-semibold">{artist.bookingStatus || 'Confirmed'}</span>
                  </div>
                </div>

                {/* Rider Checklist mini pills */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className={`px-2 py-0.5 rounded flex items-center gap-1 border ${
                    artist.technicalRider?.stagePlotAttached
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    Tech Rider {artist.technicalRider?.stagePlotAttached ? '✓' : ''}
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
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                DETAIL RIDER ARTIS TERPILIH
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {selectedArtist.name}
                <span className="text-xs font-normal px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {selectedArtist.type}
                </span>
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                  {selectedArtist.bookingStatus}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="font-mono text-emerald-400 font-bold text-base bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 mr-2">
                Fee: {formatIDR(selectedArtist.fee)}
              </div>
              <button
                onClick={() => handleOpenEditModal(selectedArtist)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Artis
              </button>
              <button
                onClick={() => handleOpenDeleteModal(selectedArtist)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            {/* Technical Rider Spec */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Spesifikasi Technical Rider & Panggung
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  selectedArtist.technicalRider?.stagePlotAttached
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {selectedArtist.technicalRider?.stagePlotAttached ? 'Stage Plot Ready' : 'Plot Pending'}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {selectedArtist.technicalRider?.audioRequirement ||
                  'FOH Digital Console Avid S6L / DiGiCo SD12, 12 Monitor Mix IEM Sennheiser G4.'}
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-slate-400">
                <div><span className="text-slate-500">Panggung:</span> {selectedArtist.technicalRider?.stageRequirement || 'Min 16m x 12m Rigging Safe'}</div>
                <div><span className="text-slate-500">Backline:</span> Drum Kit, 2x Guitar Amp Tube, 1x Bass Amp 4x10</div>
              </div>
            </div>

            {/* Hospitality Rider Spec */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  Hospitality, Hotel & Ruang Tunggu
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  VIP Backstage
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {selectedArtist.hospitalityRider?.dressingRooms ||
                  '1 Ruang VIP AC dingin, 2 Van Toyota Alphard, 10 Kartu VIP All Access.'}
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-slate-400">
                <div><span className="text-slate-500">Akomodasi Hotel:</span> {selectedArtist.hospitalityRider?.hotelRequirement || 'Hotel Bintang 5 Dekat Venue'}</div>
                <div><span className="text-slate-500">Agency / PIC:</span> {selectedArtist.agency || 'Indie'} ({selectedArtist.contactPerson || '-'}, {selectedArtist.phone || '-'})</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORM CREATE / EDIT ARTIST */}
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
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingArtist ? 'Edit Data Artis / Band' : 'Tambah Artis / Band Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingArtist
                      ? `Perbarui spesifikasi lineup dan rider untuk ${editingArtist.name}`
                      : 'Lengkapi identitas musisi, honorarium, dan spesifikasi riders panggung'}
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
            <form onSubmit={handleSaveArtist} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Profil Artis */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Profil Artis & Jadwal Event</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Artis / Band *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sheila On 7 / Hindia / Barasuara"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Genre Musik</label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="Pop Rock / Alternative / Jazz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tipe Lineup</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as ArtistType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {ARTIST_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Status Booking</label>
                    <select
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value as ArtistBookingStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Event Penugasan</label>
                    <select
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} ({ev.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Manajemen & Honorarium */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>2. Manajemen, Kontak & Fee Kontrak</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Management / Agency</label>
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="507 Management / Sun Eater"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Kontak Person (Road Manager)</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">No. HP / WA</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-semibold text-slate-300">
                      Performance Fee / Honorarium Kontrak (IDR) *
                    </label>
                    <input
                      type="number"
                      step="5000000"
                      value={fee}
                      onChange={(e) => setFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(fee || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Technical & Hospitality Rider */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>3. Spesifikasi Riders & Fasilitas</span>
                </div>

                <div className="space-y-3">
                  <RiderGearComboboxInput
                    items={gearList}
                    onChange={setGearList}
                    label="Kebutuhan Audio & Panggung (Technical Rider - Smart Autocomplete)"
                    placeholder="Cari alat di katalog gudang ERP (misal DiGiCo, Marshall, Yamaha) atau ketik kebutuhan vendor eksternal..."
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="stagePlotAttached"
                      checked={stagePlotAttached}
                      onChange={(e) => setStagePlotAttached(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="stagePlotAttached" className="text-xs text-slate-300 font-medium">
                      Stage Plot & Input Patch List sudah terverifikasi dan dilampirkan
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Ruang Tunggu & Hospitality Backstage</label>
                      <input
                        type="text"
                        value={dressingRooms}
                        onChange={(e) => setDressingRooms(e.target.value)}
                        placeholder="1 Ruang VIP AC dingin, 2 Van Alphard"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                      </input>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Kebutuhan Hotel & Transportasi</label>
                      <input
                        type="text"
                        value={hotelRequirement}
                        onChange={(e) => setHotelRequirement(e.target.value)}
                        placeholder="Hotel Bintang 5 Dekat Venue (1 Suite + 4 Deluxe)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
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
                  <span>{editingArtist ? 'Simpan Perubahan Artis' : 'Tambah Artis ke Roster'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingArtist && (
        <div
          onClick={() => setDeletingArtist(null)}
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
              <h3 className="text-base font-bold text-white">Hapus Lineup Artis?</h3>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-rose-300">{deletingArtist.name}</span> dari daftar lineup festival?
              </p>
            </div>

            {eventLinkedToDeleting && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3 rounded-xl text-left space-y-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Perhatian: Terdaftar pada Event!
                </div>
                <div className="text-[11px] text-slate-300">
                  Artis ini saat ini dijadwalkan tampil pada event:
                </div>
                <div className="text-[11px] text-amber-200 font-semibold truncate">
                  {eventLinkedToDeleting.name}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingArtist(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Hapus Artis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
