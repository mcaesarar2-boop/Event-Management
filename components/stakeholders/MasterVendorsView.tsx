'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  Filter,
  CreditCard,
  FileText,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Search,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { Vendor, PurchaseOrder, Event, VendorCategory } from '@/lib/types';
import { formatIDR } from '@/lib/utils/format';

interface MasterVendorsViewProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateVendor?: (vendor: Omit<Vendor, 'id' | 'activeEventsCount'>) => void;
  onUpdateVendor?: (id: string, vendor: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
}

const VENDOR_CATEGORIES: VendorCategory[] = [
  'Stage',
  'Sound',
  'Lighting',
  'LED',
  'Rigging',
  'Generator',
  'Catering',
  'Security',
  'Medical',
  'Transportation',
  'Accommodation',
  'Printing',
  'Documentation',
  'Broadcast',
  'Streaming',
  'Production',
  'Other',
];

export function MasterVendorsView({
  vendors,
  purchaseOrders,
  events,
  onSelectEvent,
  onCreateVendor,
  onUpdateVendor,
  onDeleteVendor,
}: MasterVendorsViewProps) {
  const [activeTab, setActiveTab] = useState<'VENDORS' | 'PURCHASE_ORDERS'>('VENDORS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0] || null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Sound');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [npwp, setNpwp] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [rating, setRating] = useState<number>(5.0);
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setCompany('');
    setCategory('Sound');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNpwp('');
    setBankName('BCA');
    setBankAccountNumber('');
    setBankAccountHolder('');
    setRating(5.0);
    setNotes('');
    setEditingVendor(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vendor: Vendor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingVendor(vendor);
    setCompany(vendor.company || vendor.name || '');
    setCategory((vendor.category as VendorCategory) || 'Sound');
    setContactPerson(vendor.contactPerson || '');
    setPhone(vendor.phone || '');
    setEmail(vendor.email || '');
    setAddress(vendor.address || '');
    setNpwp(vendor.npwp || '');
    setBankName(vendor.bankName || 'BCA');
    setBankAccountNumber(vendor.bankAccountNumber || '');
    setBankAccountHolder(vendor.bankAccountHolder || '');
    setRating(vendor.rating || 5.0);
    setNotes(vendor.notes || '');
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (vendor: Vendor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingVendor(vendor);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !contactPerson.trim()) {
      alert('Nama perusahaan dan kontak person wajib diisi.');
      return;
    }

    const payload = {
      company: company.trim(),
      name: company.trim(),
      category,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      npwp: npwp.trim(),
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountHolder: bankAccountHolder.trim(),
      rating: Number(rating) || 5.0,
      notes: notes.trim(),
    };

    if (editingVendor) {
      if (onUpdateVendor) {
        onUpdateVendor(editingVendor.id, payload);
      }
      if (selectedVendor?.id === editingVendor.id) {
        setSelectedVendor({ ...editingVendor, ...payload });
      }
    } else {
      if (onCreateVendor) {
        onCreateVendor(payload);
      }
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingVendor) return;
    if (onDeleteVendor) {
      onDeleteVendor(deletingVendor.id);
    }
    if (selectedVendor?.id === deletingVendor.id) {
      setSelectedVendor(vendors.find((v) => v.id !== deletingVendor.id) || null);
    }
    setDeletingVendor(null);
  };

  // Filter categories
  const categoriesFilterList = ['ALL', ...VENDOR_CATEGORIES];

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        v.company.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        (v.category && v.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [vendors, categoryFilter, searchQuery]);

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
  const activePOs = purchaseOrders.filter((po) => po.status !== 'Completed' && po.status !== 'Cancelled').length;

  const posForSelectedVendor = useMemo(() => {
    if (!selectedVendor) return [];
    return purchaseOrders.filter(
      (po) => po.vendorId === selectedVendor.id || po.vendorName?.toLowerCase() === selectedVendor.company?.toLowerCase()
    );
  }, [selectedVendor, purchaseOrders]);

  const posForDeletingVendor = useMemo(() => {
    if (!deletingVendor) return [];
    return purchaseOrders.filter(
      (po) => po.vendorId === deletingVendor.id || po.vendorName?.toLowerCase() === deletingVendor.company?.toLowerCase()
    );
  }, [deletingVendor, purchaseOrders]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            PROCUREMENT & SUPPLY CHAIN
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendors Directory & Purchase Orders</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Katalog rekanan vendor produksi panggung, sound system, lighting, genset, serta tracking komitmen Purchase Order (PO).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('VENDORS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeTab === 'VENDORS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Direktori Vendor ({vendors.length})
            </button>
            <button
              onClick={() => setActiveTab('PURCHASE_ORDERS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeTab === 'PURCHASE_ORDERS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Purchase Orders ({purchaseOrders.length})
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Vendor Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Rekanan Terverifikasi</div>
          <div className="text-2xl font-bold text-white font-mono">{vendors.length} Vendor</div>
          <div className="text-xs text-emerald-400 mt-1">Kualifikasi Standar Konser & Festival</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Nilai Purchase Order (PO)</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{formatIDR(totalPOValue)}</div>
          <div className="text-xs text-slate-400 mt-1">Kontrak Komitmen Pengadaan Aktif</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">PO Dalam Pengerjaan</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{activePOs} Active POs</div>
          <div className="text-xs text-slate-400 mt-1">Sedang diproses / load-in venue</div>
        </div>
      </div>

      {/* VENDORS CATALOG TAB */}
      {activeTab === 'VENDORS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama vendor, PIC, atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
              {categoriesFilterList.slice(0, 7).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const vendorPOs = purchaseOrders.filter(
                (p) => p.vendorId === vendor.id || p.vendorName?.toLowerCase() === vendor.company?.toLowerCase()
              );
              const vendorTotal = vendorPOs.reduce((s, p) => s + (p.total || 0), 0);
              const isSelected = selectedVendor?.id === vendor.id;

              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between shadow-sm relative group ${
                    isSelected
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="pr-2">
                        <div className="font-bold text-white text-base leading-tight">{vendor.company}</div>
                        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {vendor.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-amber-400 font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{vendor.rating || 5.0}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => handleOpenEditModal(vendor, e)}
                            title="Edit Vendor"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenDeleteModal(vendor, e)}
                            title="Hapus Vendor"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>{vendor.contactPerson} ({vendor.phone})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{vendor.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Total Order / PO</div>
                      <div className="font-mono font-bold text-emerald-400">{formatIDR(vendorTotal)}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {vendorPOs.length} PO Terbit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Vendor Detail Drawer */}
          {selectedVendor && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                    DETAIL PROFIL REKANAN VENDOR
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                    {selectedVendor.company}
                    <span className="text-xs font-normal px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                      {selectedVendor.category}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedVendor)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profil
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(selectedVendor)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Vendor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Kontak & Lokasi */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <Building2 className="w-3.5 h-3.5" />
                    Kontak & Operasional
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">PIC:</span> {selectedVendor.contactPerson}</p>
                    <p><span className="text-slate-500">Telepon / WA:</span> {selectedVendor.phone}</p>
                    <p><span className="text-slate-500">Email:</span> {selectedVendor.email}</p>
                    <p className="text-slate-400 text-[11px] pt-1">{selectedVendor.address}</p>
                  </div>
                </div>

                {/* Perbankan & NPWP */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <CreditCard className="w-3.5 h-3.5" />
                    Finansial & Rekening
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Bank:</span> {selectedVendor.bankName || 'BCA'}</p>
                    <p><span className="text-slate-500">No. Rekening:</span> <span className="font-mono text-white font-semibold">{selectedVendor.bankAccountNumber || '883-0192-881'}</span></p>
                    <p><span className="text-slate-500">A/N:</span> {selectedVendor.bankAccountHolder || selectedVendor.company}</p>
                    <p><span className="text-slate-500">NPWP:</span> <span className="font-mono text-slate-400">{selectedVendor.npwp || '01.234.567.8-012.000'}</span></p>
                  </div>
                </div>

                {/* Catatan Kerjasama */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-amber-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    Catatan Rekanan & Rating
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{selectedVendor.rating || 5.0} / 5.0 Rating Pelayanan</span>
                    </div>
                    <p className="text-slate-400 text-xs italic mt-1">
                      {selectedVendor.notes || 'Vendor terverifikasi standar konser internasional dengan sertifikasi keselamatan kerja panggung.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Orders linked to this vendor */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
                  <span>Riwayat Purchase Order (PO) Vendor ({posForSelectedVendor.length})</span>
                </div>
                {posForSelectedVendor.length === 0 ? (
                  <div className="bg-slate-950 p-4 rounded-xl text-center text-slate-500 text-xs border border-slate-800">
                    Belum ada Purchase Order (PO) yang diterbitkan untuk vendor ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Nomor PO</th>
                          <th className="py-2.5 px-3">Event</th>
                          <th className="py-2.5 px-3 text-right">Nilai PO</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {posForSelectedVendor.map((po) => {
                          const ev = events.find((e) => e.id === po.eventId);
                          return (
                            <tr key={po.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{po.poNumber}</td>
                              <td className="py-2.5 px-3 text-white">{ev?.name || 'All Events'}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">{formatIDR(po.total)}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                                  {po.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {ev && (
                                  <button
                                    onClick={() => onSelectEvent(ev.id)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                                  >
                                    Lihat Event
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PURCHASE ORDERS TAB */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Log Pengadaan PO (Purchase Order) Lintas Event</h2>
              <p className="text-xs text-slate-400 mt-0.5">Kontrak resmi pengadaan peralatan dan jasa teknis event.</p>
            </div>
          </div>
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Nomor PO</th>
                  <th className="py-3.5 px-4 font-semibold">Vendor Rekanan</th>
                  <th className="py-3.5 px-4 font-semibold">Event Terkait</th>
                  <th className="py-3.5 px-4 font-semibold">Target Delivery / Load-In</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Nilai Total (IDR)</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.map((po) => {
                  const ev = events.find((e) => e.id === po.eventId);
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-indigo-400">{po.poNumber}</div>
                        <div className="text-[10px] text-slate-400">{po.paymentTerms || 'Terms Net-30'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{po.vendorName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {ev?.name || 'All'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {po.deliveryDate || po.expectedDelivery || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatIDR(po.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          po.status === 'Completed' || po.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : po.status === 'Issued' || po.status === 'Approved'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {ev ? (
                          <button
                            onClick={() => onSelectEvent(ev.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                          >
                            Buka Event
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: FORM CREATE / EDIT VENDOR */}
      {isFormModalOpen && (
        <div
          onClick={() => setIsFormModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden cursor-default my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingVendor ? 'Edit Rekanan Vendor' : 'Tambah Rekanan Vendor Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingVendor
                      ? `Perbarui rincian data untuk ${editingVendor.company}`
                      : 'Lengkapi profil vendor, kontak person, dan spesifikasi perbankan'}
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

            {/* Modal Form Body */}
            <form onSubmit={handleSaveVendor} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Identitas */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Identitas & Spesialisasi Vendor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Perusahaan / Vendor *</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Contoh: PT Soundindo Perkasa Abadi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Kategori Layanan / Pengadaan *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VendorCategory)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {VENDOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Rating Evaluasi Rekanan (1.0 - 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Kontak & Lokasi */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>2. Kontak PIC & Workshop</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama PIC Lapangan *</label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Ir. Johanes Handoko"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">No. Telepon / WA *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 811-3344-5566"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Resmi</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@soundindo.co.id"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-semibold text-slate-300">Alamat Gudang / Workshop</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Kawasan Industri Pulogadung Blok F-4, Jakarta Timur"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Finansial & Administrasi */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>3. Administrasi Pembayaran & Rekening Bank</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Bank</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BCA / Mandiri / BNI"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nomor Rekening</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="883-0192-881"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={bankAccountHolder}
                      onChange={(e) => setBankAccountHolder(e.target.value)}
                      placeholder="PT Soundindo Perkasa"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-semibold text-slate-300">Nomor Pokok Wajib Pajak (NPWP)</label>
                    <input
                      type="text"
                      value={npwp}
                      onChange={(e) => setNpwp(e.target.value)}
                      placeholder="01.234.567.8-012.000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-semibold text-slate-300">Catatan Khusus / Kualifikasi Alat</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Memiliki armada L-Acoustics K2 resmi, genset silent Cummins 500kVA, sertifikasi Disnaker."
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
                  <span>{editingVendor ? 'Simpan Perubahan Vendor' : 'Tambah Vendor ke Direktori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingVendor && (
        <div
          onClick={() => setDeletingVendor(null)}
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
              <h3 className="text-base font-bold text-white">Hapus Rekanan Vendor?</h3>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus data rekanan vendor <span className="font-bold text-rose-300">{deletingVendor.company}</span>?
              </p>
            </div>

            {posForDeletingVendor.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3 rounded-xl text-left space-y-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Perhatian: Vendor Memiliki Riwayat PO!
                </div>
                <div className="text-[11px] text-slate-300">
                  Vendor ini memiliki <span className="font-bold">{posForDeletingVendor.length} Purchase Order</span> aktif:
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-200/90 pl-1 space-y-0.5">
                  {posForDeletingVendor.slice(0, 3).map((p) => (
                    <li key={p.id} className="truncate">{p.poNumber} - {p.status}</li>
                  ))}
                  {posForDeletingVendor.length > 3 && (
                    <li>dan {posForDeletingVendor.length - 3} PO lainnya...</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVendor(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Hapus Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
