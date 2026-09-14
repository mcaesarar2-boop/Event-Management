'use client';

import React, { useState, useMemo } from 'react';
import {
  Handshake,
  Plus,
  Building2,
  DollarSign,
  Gift,
  Award,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  Filter,
  Search,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  Tag,
  Radio,
  Tv,
  MapPin,
  Utensils,
  Truck,
  Ticket,
  Shirt,
  Users,
  Lock,
} from 'lucide-react';
import {
  SponsorshipItem,
  SponsorshipType,
  SponsorshipGroup,
  SponsorshipTier,
  SponsorshipStatus,
  Event,
} from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface MasterSponsorshipViewProps {
  sponsorships: SponsorshipItem[];
  allSponsors?: SponsorshipItem[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateSponsorship?: (item: Omit<SponsorshipItem, 'id'>) => void;
  onUpdateSponsorship?: (id: string, item: Partial<SponsorshipItem>) => void;
  onDeleteSponsorship?: (id: string) => void;
  selectedEventFilterId?: string;
}

export const SPONSOR_GROUPS = [
  'Kelompok Sponsor Utama & Tingkatan (Tiered Sponsorship)',
  'Kelompok Mitra Strategis (Partnership)',
  'Skema Alternatif / Eksklusif',
  'Lainnya (Custom)',
];

export const SPONSOR_TIERS_PRESETS = [
  // Tiered Sponsorship (Cash)
  'Sponsor Utama (Title/Platinum Sponsor)',
  'Sponsor Madya (Gold Sponsor)',
  'Sponsor Pendamping (Silver Sponsor)',
  'Sponsor Pendukung (Bronze Sponsor)',
  // Strategic Partnership (In-Kind)
  'Media Partner',
  'Official Venue Partner',
  'Official Food & Beverage Partner',
  'Logistics & Transport Partner',
  'Ticketing Partner',
  'Apparel/Merchandise Partner',
  'Community Partner',
  // Alternative / Exclusive
  'Sponsor Eksklusif (Exclusive Sponsor)',
  'Custom / Kategori Lainnya',
];

export const SPONSOR_STATUS_LIST: SponsorshipStatus[] = [
  'Proposal Sent',
  'Negotiation',
  'Confirmed',
  'Contract Signed',
  'In Progress',
  'Completed',
  'Declined',
];

export function MasterSponsorshipView({
  sponsorships,
  allSponsors = [],
  events,
  onSelectEvent,
  onCreateSponsorship,
  onUpdateSponsorship,
  onDeleteSponsorship,
  selectedEventFilterId,
}: MasterSponsorshipViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'CASH' | 'IN_KIND'>('ALL');
  const [eventFilter, setEventFilter] = useState<string>(selectedEventFilterId || 'ALL');
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorshipItem | null>(sponsorships[0] || null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<SponsorshipItem | null>(null);
  const [deletingSponsor, setDeletingSponsor] = useState<SponsorshipItem | null>(null);

  // Form State
  const [sponsorName, setSponsorName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [type, setType] = useState<SponsorshipType>('CASH');
  const [group, setGroup] = useState<string>(SPONSOR_GROUPS[0]);
  const [tier, setTier] = useState<string>(SPONSOR_TIERS_PRESETS[0]);
  const [customTier, setCustomTier] = useState('');
  const [eventId, setEventId] = useState<string>(selectedEventFilterId || '');
  const [contributionValue, setContributionValue] = useState<number>(100000000);
  const [receivedValue, setReceivedValue] = useState<number>(100000000);
  const [status, setStatus] = useState<SponsorshipStatus>('Contract Signed');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [inKindDetails, setInKindDetails] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Pool of all available master brands for auto-fill
  const masterBrandCatalog = useMemo(() => {
    const combined = allSponsors.length > 0 ? allSponsors : sponsorships;
    const seen = new Set<string>();
    const list: SponsorshipItem[] = [];
    combined.forEach((item) => {
      const key = (item.brandName || item.sponsorName).trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    });
    return list;
  }, [allSponsors, sponsorships]);

  const resetForm = () => {
    setSponsorName('');
    setBrandName('');
    setType('CASH');
    setGroup(SPONSOR_GROUPS[0]);
    setTier(SPONSOR_TIERS_PRESETS[0]);
    setCustomTier('');
    setEventId(selectedEventFilterId || '');
    setContributionValue(100000000);
    setReceivedValue(100000000);
    setStatus('Contract Signed');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setDeliverables('');
    setInKindDetails('');
    setContractNumber('');
    setNotes('');
    setEditingSponsor(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: SponsorshipItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSponsor(item);
    setSponsorName(item.sponsorName || '');
    setBrandName(item.brandName || '');
    setType(item.type || 'CASH');
    setGroup(item.group || SPONSOR_GROUPS[0]);
    if (SPONSOR_TIERS_PRESETS.includes(item.tier)) {
      setTier(item.tier);
      setCustomTier('');
    } else {
      setTier('Custom / Kategori Lainnya');
      setCustomTier(item.tier);
    }
    setEventId(item.eventId || selectedEventFilterId || '');
    setContributionValue(item.contributionValue || 0);
    setReceivedValue(item.receivedValue || 0);
    setStatus(item.status || 'Contract Signed');
    setContactPerson(item.contactPerson || '');
    setPhone(item.phone || '');
    setEmail(item.email || '');
    setDeliverables(item.deliverables || '');
    setInKindDetails(item.inKindDetails || '');
    setContractNumber(item.contractNumber || '');
    setNotes(item.notes || '');
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (item: SponsorshipItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingSponsor(item);
  };

  const handleSaveSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) {
      alert('Nama perusahaan sponsor wajib diisi.');
      return;
    }

    const resolvedTier =
      tier === 'Custom / Kategori Lainnya' && customTier.trim()
        ? customTier.trim()
        : tier;

    const payload = {
      sponsorName: sponsorName.trim(),
      brandName: brandName.trim() || sponsorName.trim(),
      type,
      group,
      tier: resolvedTier as SponsorshipTier,
      eventId: eventId.trim() ? eventId.trim() : null,
      contributionValue: Number(contributionValue) || 0,
      receivedValue: Number(receivedValue) || 0,
      paymentStatus: (Number(receivedValue) >= Number(contributionValue)
        ? 'PAID'
        : Number(receivedValue) > 0
        ? 'PARTIALLY_PAID'
        : 'PENDING') as any,
      status,
      contactPerson: contactPerson.trim() || sponsorName.trim(),
      phone: phone.trim() || '+62 811-0000-0000',
      email: email.trim() || 'sponsorship@partner.id',
      deliverables: deliverables.trim(),
      inKindDetails: inKindDetails.trim(),
      contractNumber: contractNumber.trim(),
      contractDate: editingSponsor?.contractDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };

    if (editingSponsor) {
      if (onUpdateSponsorship) {
        onUpdateSponsorship(editingSponsor.id, payload);
      }
      if (selectedSponsor?.id === editingSponsor.id) {
        setSelectedSponsor({ ...editingSponsor, ...payload } as SponsorshipItem);
      }
    } else {
      if (onCreateSponsorship) {
        onCreateSponsorship(payload);
      }
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingSponsor) return;
    if (onDeleteSponsorship) {
      onDeleteSponsorship(deletingSponsor.id);
    }
    if (selectedSponsor?.id === deletingSponsor.id) {
      setSelectedSponsor(sponsorships.find((s) => s.id !== deletingSponsor.id) || null);
    }
    setDeletingSponsor(null);
  };

  // Filtered sponsorships
  const filteredSponsorships = useMemo(() => {
    return sponsorships.filter((s) => {
      // Event filter
      if (eventFilter === 'UNASSIGNED') {
        if (s.eventId) return false;
      } else if (eventFilter !== 'ALL' && s.eventId !== eventFilter) {
        return false;
      }
      // Group filter
      if (selectedGroupFilter !== 'ALL' && s.group !== selectedGroupFilter) {
        return false;
      }
      // Type filter
      if (selectedTypeFilter !== 'ALL' && s.type !== selectedTypeFilter) {
        return false;
      }
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.sponsorName.toLowerCase().includes(q) ||
        (s.brandName && s.brandName.toLowerCase().includes(q)) ||
        (s.tier && s.tier.toLowerCase().includes(q)) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.deliverables && s.deliverables.toLowerCase().includes(q)) ||
        (s.inKindDetails && s.inKindDetails.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [sponsorships, eventFilter, selectedGroupFilter, selectedTypeFilter, searchQuery]);

  // Aggregations
  const totalCashValue = useMemo(() => {
    return sponsorships
      .filter((s) => s.type === 'CASH' && (eventFilter === 'ALL' || (eventFilter === 'UNASSIGNED' ? !s.eventId : s.eventId === eventFilter)))
      .reduce((sum, s) => sum + (s.contributionValue || 0), 0);
  }, [sponsorships, eventFilter]);

  const totalInKindValue = useMemo(() => {
    return sponsorships
      .filter((s) => s.type === 'IN_KIND' && (eventFilter === 'ALL' || (eventFilter === 'UNASSIGNED' ? !s.eventId : s.eventId === eventFilter)))
      .reduce((sum, s) => sum + (s.contributionValue || 0), 0);
  }, [sponsorships, eventFilter]);

  const totalReceivedCash = useMemo(() => {
    return sponsorships
      .filter((s) => s.type === 'CASH' && (eventFilter === 'ALL' || (eventFilter === 'UNASSIGNED' ? !s.eventId : s.eventId === eventFilter)))
      .reduce((sum, s) => sum + (s.receivedValue || 0), 0);
  }, [sponsorships, eventFilter]);

  const getTierIcon = (tierStr: string) => {
    if (tierStr.includes('Title') || tierStr.includes('Utama')) return Award;
    if (tierStr.includes('Gold') || tierStr.includes('Madya')) return Sparkles;
    if (tierStr.includes('Eksklusif')) return Lock;
    if (tierStr.includes('Media')) return Tv;
    if (tierStr.includes('Venue')) return MapPin;
    if (tierStr.includes('Food') || tierStr.includes('Beverage')) return Utensils;
    if (tierStr.includes('Transport') || tierStr.includes('Logistics')) return Truck;
    if (tierStr.includes('Ticketing')) return Ticket;
    if (tierStr.includes('Apparel') || tierStr.includes('Merchandise')) return Shirt;
    if (tierStr.includes('Community')) return Users;
    return Building2;
  };

  const eventLinkedToSelected = events.find((e) => e.id === selectedSponsor?.eventId);
  const eventLinkedToDeleting = events.find((e) => e.id === deletingSponsor?.eventId);

  const currentEvent = selectedEventFilterId ? events.find((e) => e.id === selectedEventFilterId) : undefined;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Handshake className="w-4 h-4" />
            {currentEvent ? `SPONSORSHIP • ${currentEvent.name}` : 'FINANCE & COMMERCIAL PARTNERSHIP'}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {currentEvent ? `Sponsorship & Partners: ${currentEvent.name}` : 'Sponsorship & Strategic Partners'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {currentEvent
              ? 'Kelola mitra sponsor tunai & barter untuk event ini. Anda dapat memilih dari katalog brand yang sudah terdaftar.'
              : 'Database master sponsor & partner: input data pure brand sponsor, kontrak dana tunai (Tiered Cash), barter in-kind, atau skema eksklusif.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl hidden sm:inline-block">
            <span className="font-bold text-white">{filteredSponsorships.length}</span> Mitra Terdata
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{currentEvent ? '+ Tambah Sponsor Event' : '+ Tambah Sponsor / Brand'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Sponsorship */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium uppercase flex items-center justify-between">
            <span>Total Komitmen Tunai (Cash)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatIDR(totalCashValue)}
          </div>
          <div className="text-xs text-slate-400">
            Diterima: <span className="text-white font-mono">{formatCompactIDR(totalReceivedCash)}</span>
          </div>
        </div>

        {/* In-Kind Strategic Partners */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium uppercase flex items-center justify-between">
            <span>Nilai Kemitraan Barter (In-Kind)</span>
            <Gift className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {formatIDR(totalInKindValue)}
          </div>
          <div className="text-xs text-slate-400">
            Penghematan Anggaran Operasional
          </div>
        </div>

        {/* Total Akumulatif Nilai Sponsorship */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium uppercase flex items-center justify-between">
            <span>Total Nilai Dukungan Mitra</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatIDR(totalCashValue + totalInKindValue)}
          </div>
          <div className="text-xs text-indigo-400">
            Kombinasi Kas & Fasilitas Barter
          </div>
        </div>

        {/* Total Partners Terkontrak */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium uppercase flex items-center justify-between">
            <span>Mitra Terverifikasi & Kontrak</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {sponsorships.filter((s) => s.status === 'Contract Signed' || s.status === 'Confirmed').length} / {sponsorships.length} Mitra
          </div>
          <div className="text-xs text-slate-400">
            Kontrak Resmi & Deliverables Aktif
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari sponsor, brand, tier, deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {!selectedEventFilterId && (
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-700 text-xs text-slate-300 py-2 px-3 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Sponsor (Global)</option>
              <option value="UNASSIGNED">Master Brand (Belum Ditugaskan)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedGroupFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedGroupFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Semua Kelompok
          </button>
          <button
            onClick={() => setSelectedGroupFilter('Kelompok Sponsor Utama & Tingkatan (Tiered Sponsorship)')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedGroupFilter === 'Kelompok Sponsor Utama & Tingkatan (Tiered Sponsorship)'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            🏢 Tiered Cash
          </button>
          <button
            onClick={() => setSelectedGroupFilter('Kelompok Mitra Strategis (Partnership)')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedGroupFilter === 'Kelompok Mitra Strategis (Partnership)'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            🤝 Mitra In-Kind
          </button>
          <button
            onClick={() => setSelectedGroupFilter('Skema Alternatif / Eksklusif')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedGroupFilter === 'Skema Alternatif / Eksklusif'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            💡 Eksklusif
          </button>
        </div>
      </div>

      {/* Grid of Sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSponsorships.map((sponsor) => {
          const ev = events.find((e) => e.id === sponsor.eventId);
          const isSelected = selectedSponsor?.id === sponsor.id;
          const TierIcon = getTierIcon(sponsor.tier);

          const isCash = sponsor.type === 'CASH';

          return (
            <div
              key={sponsor.id}
              onClick={() => setSelectedSponsor(sponsor)}
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm relative ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <div className="font-bold text-white text-base leading-tight">
                        {sponsor.brandName || sponsor.sponsorName}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {sponsor.sponsorName}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isCash
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {isCash ? 'Cash' : 'In-Kind'}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleOpenEditModal(sponsor, e)}
                        title="Edit Kontrak / Nominal Sponsor"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDeleteModal(sponsor, e)}
                        title="Hapus Sponsor"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                  <TierIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-amber-200 truncate">{sponsor.tier}</span>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Event:</span>
                    {ev ? (
                      <span className="text-slate-200 font-medium truncate max-w-[170px]">
                        {ev.name}
                      </span>
                    ) : (
                      <span className="text-indigo-400/90 font-medium text-[11px] bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                        Master Brand (Umum)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      {isCash ? 'Nilai Kontrak Cash:' : 'Nilai Estimasi Barter:'}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isCash ? 'text-emerald-400' : 'text-sky-400'
                      }`}
                    >
                      {formatIDR(sponsor.contributionValue)}
                    </span>
                  </div>

                  {isCash && sponsor.receivedValue !== undefined && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Realisasi Dana Masuk:</span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {formatIDR(sponsor.receivedValue)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        sponsor.status === 'Contract Signed' || sponsor.status === 'Confirmed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          : sponsor.status === 'In Progress' || sponsor.status === 'Negotiation'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {sponsor.status}
                    </span>
                  </div>
                </div>

                {/* Deliverables snippet */}
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 line-clamp-2">
                  <span className="text-indigo-400 font-medium">Deliverables: </span>
                  {sponsor.deliverables || sponsor.inKindDetails || 'Paket branding & promosi standar.'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Klik untuk melihat detail</span>
                {ev ? (
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
                ) : (
                  <button
                    onClick={(e) => handleOpenEditModal(sponsor, e)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                  >
                    + Pasang ke Event
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Sponsor Detail Drawer */}
      {selectedSponsor && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5" />
                DETAIL KONTRAK & DELIVERABLES SPONSOR
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {selectedSponsor.brandName || selectedSponsor.sponsorName}
                <span className="text-xs font-normal px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  {selectedSponsor.tier}
                </span>
                <span
                  className={`text-xs font-normal px-2 py-0.5 rounded ${
                    selectedSponsor.type === 'CASH'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      : 'bg-sky-950 text-sky-300 border border-sky-800/40'
                  }`}
                >
                  {selectedSponsor.type === 'CASH' ? 'Cash Sponsorship' : 'In-Kind Barter'}
                </span>
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Perusahaan: <span className="text-white font-medium">{selectedSponsor.sponsorName}</span> • Event:{' '}
                {eventLinkedToSelected ? (
                  <span className="text-indigo-300 font-medium">{eventLinkedToSelected.name}</span>
                ) : (
                  <span className="text-slate-400 font-medium">Master Brand Saja (Belum Ditugaskan)</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="font-mono text-emerald-400 font-bold text-base bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 mr-2">
                {formatIDR(selectedSponsor.contributionValue)}
              </div>
              <button
                onClick={() => handleOpenEditModal(selectedSponsor)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Nominal & Kontrak
              </button>
              <button
                onClick={() => handleOpenDeleteModal(selectedSponsor)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            {/* Hak Promosi & Deliverables */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Hak Promosi & Branding Terkontrak
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedSponsor.deliverables || 'Hak branding panggung, media placement, dan tiket VIP.'}
              </p>
              {selectedSponsor.inKindDetails && (
                <div className="pt-2 border-t border-slate-800/80 text-sky-300">
                  <span className="font-semibold text-slate-400">Dukungan In-Kind:</span> {selectedSponsor.inKindDetails}
                </div>
              )}
            </div>

            {/* Administrasi & Status Kontrak */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <FileText className="w-3.5 h-3.5" />
                Status Kontrak & Finansial
              </div>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">No. Kontrak:</span> <span className="font-mono text-white">{selectedSponsor.contractNumber || 'SPON/2027/DEFAULT'}</span></p>
                <p><span className="text-slate-500">Nilai Kontrak:</span> <span className="font-mono text-emerald-400 font-bold">{formatIDR(selectedSponsor.contributionValue)}</span></p>
                <p><span className="text-slate-500">Realisasi Masuk:</span> <span className="font-mono text-white">{formatIDR(selectedSponsor.receivedValue || 0)}</span></p>
                <p><span className="text-slate-500">Status Pembayaran:</span> <span className="text-amber-400 font-semibold">{selectedSponsor.paymentStatus || 'SCHEDULED'}</span></p>
              </div>
            </div>

            {/* Kontak PIC Sponsor */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-amber-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <Phone className="w-3.5 h-3.5" />
                Kontak PIC & Brand Manager
              </div>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">Nama PIC:</span> {selectedSponsor.contactPerson}</p>
                <p><span className="text-slate-500">Telepon / WA:</span> <span className="font-mono text-slate-200">{selectedSponsor.phone}</span></p>
                <p><span className="text-slate-500">Email:</span> {selectedSponsor.email}</p>
                {selectedSponsor.notes && (
                  <p className="text-slate-400 text-[11px] pt-1 italic">{selectedSponsor.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORM CREATE / EDIT SPONSORSHIP */}
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
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingSponsor
                      ? 'Edit Kontrak & Nominal Sponsor'
                      : currentEvent
                      ? `Tambah Sponsor untuk ${currentEvent.name}`
                      : 'Tambah Sponsor / Master Brand Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingSponsor
                      ? `Ubah nominal atau deliverables untuk ${editingSponsor.brandName || editingSponsor.sponsorName}`
                      : 'Lengkapi identitas brand, paket tingkatan sponsor, dan hak komersial'}
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
            <form onSubmit={handleSaveSponsorship} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Quick selector from Master Brand Catalog */}
              {!editingSponsor && masterBrandCatalog.length > 0 && (
                <div className="bg-indigo-950/30 border border-indigo-800/40 p-3.5 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Pilih dari Master Brand Tersimpan (Auto-Fill)
                  </label>
                  <select
                    onChange={(e) => {
                      const found = masterBrandCatalog.find((s) => s.id === e.target.value);
                      if (found) {
                        setSponsorName(found.sponsorName || '');
                        setBrandName(found.brandName || found.sponsorName || '');
                        setContactPerson(found.contactPerson || '');
                        setPhone(found.phone || '');
                        setEmail(found.email || '');
                        if (found.tier && SPONSOR_TIERS_PRESETS.includes(found.tier)) {
                          setTier(found.tier);
                        }
                        if (found.type) setType(found.type);
                        if (found.group) setGroup(found.group);
                        if (found.deliverables) setDeliverables(found.deliverables);
                        if (found.inKindDetails) setInKindDetails(found.inKindDetails);
                        if (found.notes) setNotes(found.notes);
                      }
                    }}
                    className="w-full bg-slate-950 border border-indigo-700/50 rounded-lg px-3 py-2 text-xs text-indigo-200 focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">-- Pilih Brand yang Sudah Terdaftar --</option>
                    {masterBrandCatalog.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brandName || b.sponsorName} ({b.sponsorName})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Pilih brand di atas untuk mengisi otomatis data perusahaan & kontak, lalu sesuaikan tingkatan sponsor dan nominal untuk event ini.
                  </p>
                </div>
              )}

              {/* Section 1: Identitas & Event */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Identitas Brand Sponsor & Penugasan Event</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Perusahaan / PT *</label>
                    <input
                      type="text"
                      required
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="Contoh: PT Telekomunikasi Selular"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Brand / Merek Komersial</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Contoh: Telkomsel / Livin by Mandiri"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Event Penugasan Kemitraan</span>
                      <span className="text-[10px] text-indigo-400 font-normal">
                        (Opsional - pilih kosong untuk simpan sebagai Master Brand saja)
                      </span>
                    </label>
                    <select
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Belum Ditugaskan / Master Brand Saja (Katalog Umum) --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} ({ev.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Skema & Kategori Tingkatan Sponsor */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>2. Kategori & Skema Kemitraan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Jenis Kontribusi</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as SponsorshipType;
                        setType(newType);
                        if (newType === 'IN_KIND') {
                          setGroup('Kelompok Mitra Strategis (Partnership)');
                          setTier('Media Partner');
                        } else {
                          setGroup('Kelompok Sponsor Utama & Tingkatan (Tiered Sponsorship)');
                          setTier('Sponsor Utama (Title/Platinum Sponsor)');
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CASH">DANA TUNAI (CASH CONTRIBUTION)</option>
                      <option value="IN_KIND">BARTER FASILITAS / PRODUK (IN-KIND PARTNERSHIP)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Kelompok Sponsor</label>
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {SPONSOR_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Tingkatan / Kategori Kemitraan</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {SPONSOR_TIERS_PRESETS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {tier === 'Custom / Kategori Lainnya' && (
                    <div className="space-y-1 sm:col-span-2 animate-in fade-in duration-150">
                      <label className="text-xs font-semibold text-amber-300">Ketik Kategori Kustom Anda</label>
                      <input
                        type="text"
                        required
                        value={customTier}
                        onChange={(e) => setCustomTier(e.target.value)}
                        placeholder="Contoh: Official Digital Streaming Partner"
                        className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Status Kemitraan</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SponsorshipStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {SPONSOR_STATUS_LIST.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Finansial & Nilai Kontrak */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>3. Nilai Kontrak & Realisasi Pembayaran</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      {type === 'CASH' ? 'Total Nilai Kontrak Cash (IDR) *' : 'Estimasi Nilai Barter / In-Kind (IDR) *'}
                    </label>
                    <input
                      type="number"
                      step="10000000"
                      required
                      value={contributionValue}
                      onChange={(e) => setContributionValue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(contributionValue || 0)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      {type === 'CASH' ? 'Dana yang Telah Diterima (IDR)' : 'Nilai Fasilitas Terealisasi (IDR)'}
                    </label>
                    <input
                      type="number"
                      step="10000000"
                      value={receivedValue}
                      onChange={(e) => setReceivedValue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(receivedValue || 0)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nomor Kontrak / MoA</label>
                    <input
                      type="text"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="SPON/TSEL/2027/001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama PIC Sponsor</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Ahmad Fauzi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">No. Telepon / WA PIC</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 811-0011-2233"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Resmi PIC</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sponsorship@brand.id"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Deliverables & In-Kind */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>4. Hak Promosi & Rincian Fasilitas</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Hak Promosi / Deliverables</label>
                    <textarea
                      rows={2}
                      value={deliverables}
                      onChange={(e) => setDeliverables(e.target.value)}
                      placeholder="Contoh: Logo panggung LED Wings, 50 VIP Pass, Booth aktivasi 6x6m, 10 slot TVC."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {type === 'IN_KIND' && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <label className="text-xs font-semibold text-sky-300">
                        Rincian Dukungan In-Kind / Produk Barter
                      </label>
                      <textarea
                        rows={2}
                        value={inKindDetails}
                        onChange={(e) => setInKindDetails(e.target.value)}
                        placeholder="Contoh: 3.500 botol minuman, 4 unit van VIP, atau 20 slot iklan radio harian."
                        className="w-full bg-slate-950 border border-sky-500/40 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Catatan Khusus / Terms Eksklusivitas</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Hak eksklusif kategori perbankan dan QRIS, kompetitor dilarang masuk."
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
                  <span>{editingSponsor ? 'Simpan Perubahan Sponsor' : 'Simpan Sponsor ke Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingSponsor && (
        <div
          onClick={() => setDeletingSponsor(null)}
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
              <h3 className="text-base font-bold text-white">Hapus Kemitraan Sponsor?</h3>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus mitra sponsor{' '}
                <span className="font-bold text-rose-300">
                  {deletingSponsor.brandName || deletingSponsor.sponsorName}
                </span>{' '}
                ({deletingSponsor.tier}) senilai{' '}
                <span className="font-mono text-emerald-400 font-bold">
                  {formatIDR(deletingSponsor.contributionValue)}
                </span>
                ?
              </p>
            </div>

            {eventLinkedToDeleting && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3 rounded-xl text-left space-y-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Event Terkait
                </div>
                <div className="text-[11px] text-slate-300">
                  Sponsor ini terikat kontrak pada event <span className="font-semibold text-white">{eventLinkedToDeleting.name}</span>.
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSponsor(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Hapus Sponsor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
