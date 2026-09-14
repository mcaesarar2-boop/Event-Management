'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Building2,
  FileCheck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Vendor, PurchaseOrder, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface MasterVendorsViewProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateVendor?: (vendor: Omit<Vendor, 'id' | 'activeEventsCount'>) => void;
}

export function MasterVendorsView({
  vendors,
  purchaseOrders,
  events,
  onSelectEvent,
  onCreateVendor,
}: MasterVendorsViewProps) {
  const [activeTab, setActiveTab] = useState<'VENDORS' | 'PURCHASE_ORDERS'>('VENDORS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0] || null);

  const categories = [
    'ALL',
    'Stage, Truss & Rigging',
    'Sound System & PA',
    'Lighting & Laser Show',
    'LED Screen & Visuals',
    'Generator & Electrical',
    'Barricade & Crowd Control',
    'Artist Hospitality & Hotel',
    'Security & Medical',
  ];

  const filteredVendors = vendors.filter((v) => {
    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    const matchesSearch =
      v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.address && v.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
  const activePOs = purchaseOrders.filter((po) => po.status !== 'Completed' && po.status !== 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            PROCUREMENT & SUPPLY CHAIN
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendors Directory & Purchase Orders</h1>
          <p className="text-sm text-slate-400 mt-1">
            Katalog rekanan vendor produksi panggung, sound system, lighting, genset, serta tracking komitmen Purchase Order (PO).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('VENDORS')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'VENDORS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Direktori Vendor ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('PURCHASE_ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'PURCHASE_ORDERS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Daftar Purchase Orders ({purchaseOrders.length})
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
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Cari nama vendor, PIC, atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white'
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
              const vendorPOs = purchaseOrders.filter((p) => p.vendorId === vendor.id);
              const vendorTotal = vendorPOs.reduce((s, p) => s + (p.total || 0), 0);

              return (
                <div
                  key={vendor.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-base leading-tight">{vendor.company}</div>
                        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {vendor.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{vendor.rating || 4.8}</span>
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
    </div>
  );
}
