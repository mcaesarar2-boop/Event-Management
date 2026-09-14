'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  Plus,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { Client, Event } from '@/lib/types';
import { formatIDR } from '@/lib/utils/format';

interface MasterClientsViewProps {
  clients: Client[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateClient?: (
    client: Omit<Client, 'id' | 'totalEvents' | 'activeEvents' | 'completedEvents'> & {
      totalEvents?: number;
      activeEvents?: number;
      completedEvents?: number;
      totalRevenue?: number;
      outstandingReceivable?: number;
    }
  ) => void;
  onUpdateClient?: (id: string, client: Partial<Client>) => void;
  onDeleteClient?: (id: string) => void;
}

const INDUSTRY_PRESETS = [
  'Entertainment & Music Promoter',
  'Education & Student Affairs',
  'Enterprise Software & Cloud AI',
  'Beauty & Lifestyle Brand',
  'Government & Public Sector',
  'Corporate & Financial Services',
  'FMCG & Consumer Brands',
  'Media & Broadcasting',
  'Automotive & Mobility',
  'Hospitality & Tourism',
  'Other',
];

export function MasterClientsView({
  clients,
  events,
  onSelectEvent,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
}: MasterClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [receivableFilter, setReceivableFilter] = useState<'ALL' | 'HAS_DEBT' | 'CLEAR'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'REVENUE' | 'RECEIVABLE' | 'EVENTS'>('NAME');

  // Selected client for card highlight
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [industry, setIndustry] = useState('Entertainment & Music Promoter');
  const [customIndustry, setCustomIndustry] = useState('');
  const [taxInformation, setTaxInformation] = useState('');
  const [notes, setNotes] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [outstandingReceivable, setOutstandingReceivable] = useState(0);

  // Reset form
  const resetForm = () => {
    setCompany('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setIndustry('Entertainment & Music Promoter');
    setCustomIndustry('');
    setTaxInformation('');
    setNotes('');
    setTotalRevenue(0);
    setOutstandingReceivable(0);
    setEditingClient(null);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setCompany(client.company || '');
    setContactPerson(client.contactPerson || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setAddress(client.address || '');
    if (INDUSTRY_PRESETS.includes(client.industry)) {
      setIndustry(client.industry);
      setCustomIndustry('');
    } else {
      setIndustry('Other');
      setCustomIndustry(client.industry || '');
    }
    setTaxInformation(client.taxInformation || '');
    setNotes(client.notes || '');
    setTotalRevenue(client.totalRevenue || 0);
    setOutstandingReceivable(client.outstandingReceivable || 0);
    setIsFormModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingClient(client);
  };

  // Save Client (Create or Update)
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !contactPerson.trim()) {
      alert('Nama perusahaan dan kontak person wajib diisi.');
      return;
    }

    const resolvedIndustry = industry === 'Other' && customIndustry.trim() ? customIndustry.trim() : industry;

    if (editingClient) {
      if (onUpdateClient) {
        onUpdateClient(editingClient.id, {
          company: company.trim(),
          contactPerson: contactPerson.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          industry: resolvedIndustry,
          taxInformation: taxInformation.trim(),
          notes: notes.trim(),
          totalRevenue: Number(totalRevenue) || 0,
          outstandingReceivable: Number(outstandingReceivable) || 0,
        });
      }
    } else {
      if (onCreateClient) {
        onCreateClient({
          company: company.trim(),
          contactPerson: contactPerson.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          industry: resolvedIndustry,
          taxInformation: taxInformation.trim(),
          notes: notes.trim(),
          totalRevenue: Number(totalRevenue) || 0,
          outstandingReceivable: Number(outstandingReceivable) || 0,
        });
      }
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingClient) return;
    if (onDeleteClient) {
      onDeleteClient(deletingClient.id);
    }
    if (selectedClient?.id === deletingClient.id) {
      setSelectedClient(clients.find((c) => c.id !== deletingClient.id) || null);
    }
    setDeletingClient(null);
  };

  // Unique industries for filter dropdown
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set);
  }, [clients]);

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        // Search query
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          c.company.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q);

        if (!matchesQuery) return false;

        // Industry filter
        if (selectedIndustry !== 'ALL' && c.industry !== selectedIndustry) {
          return false;
        }

        // Receivable filter
        if (receivableFilter === 'HAS_DEBT' && (c.outstandingReceivable || 0) <= 0) {
          return false;
        }
        if (receivableFilter === 'CLEAR' && (c.outstandingReceivable || 0) > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'REVENUE') {
          return (b.totalRevenue || 0) - (a.totalRevenue || 0);
        }
        if (sortBy === 'RECEIVABLE') {
          return (b.outstandingReceivable || 0) - (a.outstandingReceivable || 0);
        }
        if (sortBy === 'EVENTS') {
          const aEvCount = events.filter((e) => e.clientId === a.id || e.clientName === a.company).length;
          const bEvCount = events.filter((e) => e.clientId === b.id || e.clientName === b.company).length;
          return bEvCount - aEvCount;
        }
        return 0;
      });
  }, [clients, events, searchQuery, selectedIndustry, receivableFilter, sortBy]);

  // Aggregated KPI metrics
  const totalContractedClients = useMemo(() => clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0), [clients]);
  const totalOutstandingClients = useMemo(() => clients.reduce((sum, c) => sum + (c.outstandingReceivable || 0), 0), [clients]);

  // Events linked to client being deleted
  const eventsLinkedToDeletingClient = useMemo(() => {
    if (!deletingClient) return [];
    return events.filter((e) => e.clientId === deletingClient.id || e.clientName === deletingClient.company);
  }, [deletingClient, events]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>COMMERCIAL CRM & ACCOUNT MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients CRM & Account Directory</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Database mitra korporasi, promotor, brand sponsor, histori kontrak proyek, portofolio event, dan kontrol piutang termin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl hidden sm:inline-block">
            <span className="font-bold text-white">{clients.length}</span> Akun Klien Terdaftar
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Klien Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="text-slate-400 text-xs font-medium uppercase mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Total Klien Korporat & Brand
          </div>
          <div className="text-2xl font-bold text-white font-mono">{clients.length} Klien</div>
          <div className="text-xs text-indigo-400 mt-1 truncate">
            {uniqueIndustries.slice(0, 3).join(', ') || 'Semua Sektor Industri'}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="text-slate-400 text-xs font-medium uppercase mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Total Nilai Kontrak Seluruh Klien
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{formatIDR(totalContractedClients)}</div>
          <div className="text-xs text-slate-400 mt-1">Akumulasi Nilai Revenue Proyek Event</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="text-slate-400 text-xs font-medium uppercase mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            Piutang Proyek Klien
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{formatIDR(totalOutstandingClients)}</div>
          <div className="text-xs text-slate-400 mt-1">Invoice Pending / Menunggu Termin</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/70 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari perusahaan, kontak person, email, industri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Sorters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">Semua Industri ({clients.length})</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind} className="bg-slate-900 text-slate-200">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Receivable Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <select
              value={receivableFilter}
              onChange={(e) => setReceivableFilter(e.target.value as any)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">Semua Status Piutang</option>
              <option value="HAS_DEBT" className="bg-slate-900 text-slate-200">Memiliki Piutang Aktif</option>
              <option value="CLEAR" className="bg-slate-900 text-slate-200">Lunas / Nol Piutang</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="NAME" className="bg-slate-900 text-slate-200">Urut: Nama Perusahaan</option>
              <option value="REVENUE" className="bg-slate-900 text-slate-200">Urut: Nilai Kontrak Tertinggi</option>
              <option value="RECEIVABLE" className="bg-slate-900 text-slate-200">Urut: Sisa Piutang Terbesar</option>
              <option value="EVENTS" className="bg-slate-900 text-slate-200">Urut: Jumlah Event Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientEvents = events.filter((e) => e.clientId === client.id || e.clientName === client.company);
            const isSelected = selectedClient?.id === client.id;
            const hasDebt = (client.outstandingReceivable || 0) > 0;

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 bg-gradient-to-b from-slate-900 to-indigo-950/20'
                    : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition">
                        {client.company}
                      </div>
                      <div className="text-xs text-indigo-400 font-medium mt-0.5 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-indigo-400/80" />
                        <span className="truncate">{client.industry || 'Corporate'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 font-mono border border-slate-800">
                        {clientEvents.length} Event
                      </span>

                      {/* Action Buttons: Edit & Delete */}
                      <button
                        title="Edit Data Klien"
                        onClick={(e) => handleOpenEditModal(client, e)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-400 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Hapus Klien"
                        onClick={(e) => handleOpenDeleteModal(client, e)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info Details */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-2.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="font-medium">{client.contactPerson}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="font-mono">{client.phone || '-'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{client.email || '-'}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[11px] text-slate-400/90">{client.address || '-'}</span>
                    </div>

                    {client.taxInformation && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-0.5 font-mono">
                        <FileText className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{client.taxInformation}</span>
                      </div>
                    )}
                  </div>

                  {/* Financials: Revenue & Receivable */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs bg-slate-950/50 p-2.5 rounded-xl">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Total Nilai Proyek</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                        {formatIDR(client.totalRevenue || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Sisa Piutang</div>
                      <div
                        className={`font-mono font-bold text-sm mt-0.5 ${
                          hasDebt ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {formatIDR(client.outstandingReceivable || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Notes Preview if available */}
                  {client.notes && (
                    <div className="text-[11px] text-slate-400/80 bg-slate-950/30 p-2 rounded-lg border border-slate-800/50 italic line-clamp-2">
                      &ldquo;{client.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Event Links Footer */}
                {clientEvents.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
                      <span>Event Klien Ini:</span>
                      <span className="text-indigo-400">{clientEvents.length} terkait</span>
                    </div>
                    <div className="space-y-1.5">
                      {clientEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev.id);
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-indigo-950/50 border border-slate-800/60 text-xs text-slate-300 hover:text-white transition group/ev cursor-pointer"
                        >
                          <span className="truncate font-medium">{ev.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/ev:text-indigo-400 shrink-0 ml-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tidak Ada Klien Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ada akun klien yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('ALL');
                setReceivableFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Reset Filter
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Klien Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CLIENT */}
      {isFormModalOpen && (
        <div
          onClick={() => setIsFormModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-4 sm:my-8 cursor-default flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100">
                    {editingClient ? 'Edit Data Klien & Akun CRM' : 'Tambah Klien Baru ke CRM'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    {editingClient
                      ? `Perbarui informasi profil, kontak, dan status komersial klien ${editingClient.company}`
                      : 'Daftarkan korporasi, brand sponsor, atau promotor rekanan baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClient} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Section 1: Profil Perusahaan */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>1. Identitas Perusahaan & Industri</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Nama Perusahaan / Organisasi / Brand *</span>
                      <span className="text-[10px] text-indigo-400">Wajib diisi</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Contoh: PT Nada Nusantara Kreasi / BEM KM UGM"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Bidang Industri / Kategori</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {INDUSTRY_PRESETS.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  {industry === 'Other' ? (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Tulis Kategori Industri Lainnya</label>
                      <input
                        type="text"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        placeholder="Contoh: Mining & Energy"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Informasi Pajak / NPWP</label>
                      <input
                        type="text"
                        value={taxInformation}
                        onChange={(e) => setTaxInformation(e.target.value)}
                        placeholder="Contoh: NPWP: 01.998.887.6-012.000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: PIC & Kontak */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Kontak Person & Alamat Kantor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama PIC / Kontak Person *</label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Contoh: Siti Rahmawati"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nomor Telepon / WA *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 811-9876-5432"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Resmi *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="siti@nadanusantara.id"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-semibold text-slate-300">Alamat Lengkap Kantor / Domisili</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Contoh: Menara Palma Lt. 18, Jl. HR Rasuna Said, Jakarta Selatan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Finansial & Catatan Kerjasama */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>3. Nilai Proyek & Sisa Piutang Klien</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Total Nilai Kontrak / Revenue Proyek (IDR)
                    </label>
                    <input
                      type="number"
                      step="10000000"
                      value={totalRevenue}
                      onChange={(e) => setTotalRevenue(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(totalRevenue || 0)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Sisa Piutang Termin / Invoice Pending (IDR)
                    </label>
                    <input
                      type="number"
                      step="10000000"
                      value={outstandingReceivable}
                      onChange={(e) => setOutstandingReceivable(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-400">{formatIDR(outstandingReceivable || 0)}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Catatan Khusus / Profil Hubungan Klien</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Promotor musik nasional terkemuka. Pembayaran termin lancar 30 hari kalender."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
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
                  <span>{editingClient ? 'Simpan Perubahan Klien' : 'Tambah Klien ke Direktori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingClient && (
        <div
          onClick={() => setDeletingClient(null)}
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
              <h3 className="text-base font-bold text-white">Hapus Akun Klien?</h3>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus akun klien <span className="font-bold text-rose-300">{deletingClient.company}</span>?
              </p>
            </div>

            {eventsLinkedToDeletingClient.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3 rounded-xl text-left space-y-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Perhatian: Klien Terhubung Dengan Event!
                </div>
                <div className="text-[11px] text-slate-300">
                  Klien ini terhubung dengan <span className="font-bold">{eventsLinkedToDeletingClient.length} event</span>:
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-200/90 pl-1 space-y-0.5">
                  {eventsLinkedToDeletingClient.slice(0, 3).map((ev) => (
                    <li key={ev.id} className="truncate">{ev.name}</li>
                  ))}
                  {eventsLinkedToDeletingClient.length > 3 && (
                    <li>dan {eventsLinkedToDeletingClient.length - 3} event lainnya...</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Hapus Klien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
