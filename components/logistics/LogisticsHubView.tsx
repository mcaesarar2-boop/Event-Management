'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Truck,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Volume2,
  Speaker,
  Mic,
  Video,
  Zap,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Grid,
  List,
  Eye,
  DollarSign,
  PackageCheck,
  Wrench,
  Layers,
  ArrowUpRight,
  Info,
  X,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

export interface LogisticsItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  quantity: number;
  status: string;
  imageUrl: string | null;
  maintenanceQuantity: number | null;
  rentedQuantity: number | null;
  price: number | null;
  rentPercentage: number | null;
  Category?: Array<{ id: string; name: string }>;
}

export interface CategorySummary {
  name: string;
  icon: any;
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  maintenanceQuantity: number;
  itemCount: number;
}

const ERP_URL = 'https://erplogistik.vercel.app';

export function LogisticsHubView() {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDetailItem, setSelectedDetailItem] = useState<LogisticsItem | null>(null);

  const fetchLogisticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { data, error: fetchError } = await supabase
        .from('Item')
        .select(`
          id,
          code,
          name,
          description,
          quantity,
          status,
          imageUrl,
          maintenanceQuantity,
          rentedQuantity,
          price,
          rentPercentage,
          Category(id, name)
        `)
        .order('name', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setItems(data as LogisticsItem[] || []);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to fetch logistics items:', err);
      setError(err.message || 'Gagal memuat data dari Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  // Compute Global KPI Metrics
  const globalMetrics = useMemo(() => {
    let totalUnits = 0;
    let availableUnits = 0;
    let rentedUnits = 0;
    let maintenanceUnits = 0;
    let totalValuation = 0;

    items.forEach((item) => {
      const total = item.quantity || 0;
      const rented = item.rentedQuantity || 0;
      const maintenance = item.maintenanceQuantity || 0;
      const available = Math.max(0, total - rented - maintenance);

      totalUnits += total;
      rentedUnits += rented;
      maintenanceUnits += maintenance;
      availableUnits += available;
      totalValuation += (item.price || 0) * total;
    });

    return {
      totalSKUs: items.length,
      totalUnits,
      availableUnits,
      rentedUnits,
      maintenanceUnits,
      totalValuation,
      readyRate: totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 100,
    };
  }, [items]);

  // Specific Key Category Breakdowns (Audio, Mixer Console, Speaker, Lighting, Video, etc.)
  const keyCategories = useMemo<CategorySummary[]>(() => {
    const targetCategories = [
      { name: 'Audio', match: ['Audio'], icon: Volume2 },
      { name: 'Mixer Console', match: ['Mixer Console'], icon: Sliders },
      { name: 'Speaker & PA', match: ['Speaker', 'PA System', 'Subwoofer', 'Side Fill', 'Front Fill'], icon: Speaker },
      { name: 'Microphone', match: ['Microphone', 'Wireless System'], icon: Mic },
      { name: 'Stage Lighting', match: ['Stage Lighting', 'Studio Lighting', 'Moving Head', 'PAR LED', 'Fresnel'], icon: Sun },
      { name: 'Video & Visual', match: ['Video', 'LED-WALL', 'Camera', 'Switcher', 'Cinema'], icon: Video },
      { name: 'Power & Distro', match: ['Power', 'Generator'], icon: Zap },
    ];

    return targetCategories.map((cat) => {
      let totalQty = 0;
      let rentedQty = 0;
      let maintQty = 0;
      let count = 0;

      items.forEach((item) => {
        const itemCategories = item.Category?.map((c) => c.name.toLowerCase()) || [];
        const matchesCategory = cat.match.some((m) =>
          itemCategories.some((ic) => ic.includes(m.toLowerCase()))
        );

        if (matchesCategory) {
          count++;
          totalQty += item.quantity || 0;
          rentedQty += item.rentedQuantity || 0;
          maintQty += item.maintenanceQuantity || 0;
        }
      });

      const availQty = Math.max(0, totalQty - rentedQty - maintQty);

      return {
        name: cat.name,
        icon: cat.icon,
        totalQuantity: totalQty,
        availableQuantity: availQty,
        rentedQuantity: rentedQty,
        maintenanceQuantity: maintQty,
        itemCount: count,
      };
    });
  }, [items]);

  // Unique category list for filter pills
  const allCategoryNames = useMemo(() => {
    const catSet = new Set<string>();
    items.forEach((item) => {
      item.Category?.forEach((c) => {
        if (c.name) catSet.add(c.name);
      });
    });
    return Array.from(catSet).sort();
  }, [items]);

  // Filtered and searched items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.Category?.some((c) => c.name.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Category match
      if (selectedCategory !== 'ALL') {
        const hasCategory = item.Category?.some(
          (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // Status match
      const total = item.quantity || 0;
      const rented = item.rentedQuantity || 0;
      const maintenance = item.maintenanceQuantity || 0;
      const available = Math.max(0, total - rented - maintenance);

      if (statusFilter === 'AVAILABLE' && available <= 0) return false;
      if (statusFilter === 'RENTED' && rented <= 0) return false;
      if (statusFilter === 'MAINTENANCE' && maintenance <= 0) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategory, statusFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const inventorySectionRef = useRef<HTMLDivElement>(null);

  // Auto-reset page to 1 when search query, selected category, status filter, or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Sliced items for the active page
  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, safeCurrentPage, itemsPerPage]);

  const itemRangeStart = filteredItems.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const itemRangeEnd = Math.min(safeCurrentPage * itemsPerPage, filteredItems.length);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (inventorySectionRef.current) {
        inventorySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getPageNumbers = () => {
    const delta = 1;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const left = safeCurrentPage - delta;
    const right = safeCurrentPage + delta;

    if (left > 2) {
      pages.push('...');
    }

    const start = Math.max(2, left);
    const end = Math.min(totalPages - 1, right);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Integration Layer & External ERP Link */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/20 shadow-xl p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    ERP Logistics Hub
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Live Connected
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Sinkronisasi inventaris & ketersediaan alat logistik event secara real-time dari database pusat ERP.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchLogisticsData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              title="Refresh Data dari Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isLoading ? 'Menyinkronkan...' : 'Refresh'}</span>
            </button>

            <a
              href={ERP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Buka Full ERP</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Database Connection Subline */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Target ERP:</span>
            <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              erplogistik.vercel.app
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Database Engine:</span>
            <span className="font-mono text-slate-300">Supabase PostgreSQL</span>
          </div>
          {lastRefreshed && (
            <div className="text-slate-500">
              Terakhir diperbarui: {lastRefreshed.toLocaleTimeString('id-ID')} WIB
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-200">Gagal Mengambil Data Supabase</p>
            <p className="text-rose-300/80 text-xs mt-0.5">{error}</p>
            <button
              onClick={fetchLogisticsData}
              className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* KPI Global Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Katalog Alat</span>
            <PackageCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              {globalMetrics.totalSKUs}
              <span className="text-xs font-normal text-slate-400 ml-1.5">SKU</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total {globalMetrics.totalUnits.toLocaleString('id-ID')} unit fisik
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tersedia (Ready)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {globalMetrics.availableUnits.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400 ml-1.5">Unit</span>
            </div>
            <p className="text-[11px] text-emerald-500/80 mt-1">
              {globalMetrics.readyRate}% siap dialokasikan
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Sedang Disewa (Rented)</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-400 tracking-tight">
              {globalMetrics.rentedUnits.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400 ml-1.5">Unit</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Aktif di lapangan/event</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pemeliharaan</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-400 tracking-tight">
              {globalMetrics.maintenanceUnits.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400 ml-1.5">Unit</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sedang perbaikan/inspeksi</p>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Valuasi Aset Total</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-cyan-300 tracking-tight">
              {formatCompactIDR(globalMetrics.totalValuation)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nilai perolehan alat logistik
            </p>
          </div>
        </div>
      </div>

      {/* Category Availability Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Ringkasan Ketersediaan Alat</h2>
            <p className="text-xs text-slate-400">
              Pantau kesiapan unit logistik berdasarkan kategori utama (Audio, Mixer, Lighting, dsb). Klik kartu untuk filter langsung.
            </p>
          </div>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Reset Filter Kategori</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {keyCategories.map((cat) => {
            const Icon = cat.icon;
            const readyPct = cat.totalQuantity > 0 ? Math.round((cat.availableQuantity / cat.totalQuantity) * 100) : 100;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <div
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(isSelected ? 'ALL' : cat.name);
                }}
                className={`cursor-pointer group p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 group-hover:text-indigo-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    readyPct >= 80 ? 'bg-emerald-500/20 text-emerald-400' : readyPct >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {readyPct}% Ready
                  </span>
                </div>

                <div className="font-medium text-xs text-slate-200 truncate">{cat.name}</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-lg font-bold text-white">
                    {cat.availableQuantity}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">/ {cat.totalQuantity}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      readyPct >= 80 ? 'bg-emerald-500' : readyPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, readyPct)}%` }}
                  />
                </div>

                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                  <span>{cat.itemCount} Model</span>
                  <span>{cat.rentedQuantity > 0 ? `${cat.rentedQuantity} Disewa` : 'Semua Ready'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Catalog Controls */}
      <div ref={inventorySectionRef} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama alat, mixer console, kode AUD-MC-..., brand..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Pills, Items Per Page & View Toggles */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'ALL' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'AVAILABLE' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tersedia
              </button>
              <button
                onClick={() => setStatusFilter('RENTED')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'RENTED' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sedang Disewa
              </button>
              <button
                onClick={() => setStatusFilter('MAINTENANCE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'MAINTENANCE' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Maintenance
              </button>
            </div>

            {/* Items Per Page Selector in Header */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-xs text-slate-400">
              <span className="hidden sm:inline">Per hal:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {[10, 20, 30, 40, 50].map((num) => (
                  <option key={num} value={num} className="bg-slate-900 text-slate-200">
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-slate-400">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap pl-1">Kategori:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-500 font-medium shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            Semua ({items.length})
          </button>
          {allCategoryNames.map((catName) => (
            <button
              key={catName}
              onClick={() => setSelectedCategory(selectedCategory === catName ? 'ALL' : catName)}
              className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                selectedCategory === catName
                  ? 'bg-indigo-600 text-white border-indigo-500 font-medium shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Item Display */}
      {isLoading && items.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Memuat inventaris dari database Supabase...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Tidak ada alat yang cocok</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Coba ubah kata kunci pencarian atau sesuaikan filter status dan kategori di atas.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Similar to ERP Logistik Card Design) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedItems.map((item) => {
            const total = item.quantity || 0;
            const rented = item.rentedQuantity || 0;
            const maintenance = item.maintenanceQuantity || 0;
            const available = Math.max(0, total - rented - maintenance);
            const unitPrice = item.price || 0;
            const totalVal = unitPrice * total;
            const rentPct = item.rentPercentage || 1;
            const rentPricePerDay = unitPrice * (rentPct / 100);

            return (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/40 transition-all duration-300 overflow-hidden"
              >
                {/* Card Image Banner */}
                <div className="relative h-44 w-full bg-slate-950 flex items-center justify-center p-3 border-b border-slate-800/80 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                      <Truck className="w-10 h-10 stroke-1" />
                      <span className="text-[10px]">No Image Preview</span>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        available > 0
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      TERSEDIA: {available}
                    </span>
                  </div>

                  {/* Category Badges on Top-Left */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 max-w-[65%]">
                    {item.Category && item.Category.length > 0 ? (
                      item.Category.slice(0, 2).map((c) => (
                        <span
                          key={c.id}
                          className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-semibold bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-sm"
                        >
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-semibold bg-slate-900/90 text-slate-400 border border-slate-700/80">
                        ALAT
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] text-indigo-400 font-semibold tracking-wider">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Total {total} Unit
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mt-0.5 line-clamp-1 group-hover:text-indigo-300 transition-colors" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {item.description || 'Tidak ada deskripsi spesifikasi.'}
                    </p>
                  </div>

                  {/* Valuation & Rent Pricing Box */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Valuasi & Biaya Sewa
                    </div>
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span className="text-slate-500">Satuan:</span>
                      <span className="font-mono">{formatIDR(unitPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span className="text-slate-500">Total Aset:</span>
                      <span className="font-mono text-white font-medium">{formatIDR(totalVal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400 font-medium text-[11px] pt-0.5 border-t border-slate-800/60">
                      <span className="text-slate-400">Sewa ({rentPct}%):</span>
                      <span className="font-mono">{formatIDR(rentPricePerDay)} /hari</span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDetailItem(item)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <a
                      href={`${ERP_URL}?search=${encodeURIComponent(item.code || item.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      title="Buka item ini di ERP Logistik"
                    >
                      <span>Buka ERP</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Alat & Kode</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Total Stok</th>
                  <th className="py-3 px-3 text-right text-emerald-400">Tersedia</th>
                  <th className="py-3 px-3 text-right text-amber-400">Disewa</th>
                  <th className="py-3 px-3 text-right">Harga Satuan</th>
                  <th className="py-3 px-3 text-right">Est. Sewa/Hari</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedItems.map((item) => {
                  const total = item.quantity || 0;
                  const rented = item.rentedQuantity || 0;
                  const maintenance = item.maintenanceQuantity || 0;
                  const available = Math.max(0, total - rented - maintenance);
                  const unitPrice = item.price || 0;
                  const rentPct = item.rentPercentage || 1;
                  const rentPricePerDay = unitPrice * (rentPct / 100);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <Truck className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white line-clamp-1">{item.name}</div>
                            <div className="font-mono text-[10px] text-indigo-400">{item.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.Category?.map((c) => (
                            <span key={c.id} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            available > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {available > 0 ? 'AVAILABLE' : 'RENTED OUT'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-200">{total}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">{available}</td>
                      <td className="py-3 px-3 text-right font-medium text-amber-400">{rented}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">{formatIDR(unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatIDR(rentPricePerDay)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetailItem(item)}
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`${ERP_URL}?search=${encodeURIComponent(item.code || item.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-indigo-600/20 text-indigo-400"
                            title="Buka di ERP"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl shadow-sm text-xs">
          {/* Left: Range Info & Items Per Page Selector */}
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="text-slate-400">
              Menampilkan <span className="font-semibold text-slate-200">{itemRangeStart}</span> -{' '}
              <span className="font-semibold text-slate-200">{itemRangeEnd}</span> dari{' '}
              <span className="font-semibold text-white">{filteredItems.length}</span> item
            </span>

            <div className="flex items-center gap-1.5 text-slate-400 pl-3 border-l border-slate-800">
              <span>Per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                {[10, 20, 30, 40, 50].map((num) => (
                  <option key={num} value={num} className="bg-slate-900 text-slate-200">
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Controls */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* First Page Button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline text-xs">Sebelumnya</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 py-1 text-slate-500 font-mono select-none"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(page);
                const isActive = pageNum === safeCurrentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30 border border-indigo-500'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden md:inline text-xs">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-semibold">{selectedDetailItem.code}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedDetailItem.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image & Badges */}
            <div className="relative h-56 w-full bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-4">
              {selectedDetailItem.imageUrl ? (
                <img
                  src={selectedDetailItem.imageUrl}
                  alt={selectedDetailItem.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-slate-600 text-center">
                  <Truck className="w-12 h-12 mx-auto stroke-1" />
                  <span className="text-xs mt-1 block">Tidak ada gambar</span>
                </div>
              )}
            </div>

            {/* Tags & Categories */}
            <div className="flex flex-wrap gap-1.5">
              {selectedDetailItem.Category?.map((cat) => (
                <span
                  key={cat.id}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800/40"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spesifikasi / Catatan</h4>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                {selectedDetailItem.description || 'Tidak ada deskripsi tambahan untuk alat ini.'}
              </p>
            </div>

            {/* Stock Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <span className="text-[11px] text-emerald-400 font-medium">Tersedia (Ready)</span>
                <div className="text-xl font-bold text-emerald-300 mt-1">
                  {Math.max(
                    0,
                    (selectedDetailItem.quantity || 0) -
                      (selectedDetailItem.rentedQuantity || 0) -
                      (selectedDetailItem.maintenanceQuantity || 0)
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center">
                <span className="text-[11px] text-amber-400 font-medium">Sedang Disewa</span>
                <div className="text-xl font-bold text-amber-300 mt-1">
                  {selectedDetailItem.rentedQuantity || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
                <span className="text-[11px] text-rose-400 font-medium">Maintenance</span>
                <div className="text-xl font-bold text-rose-300 mt-1">
                  {selectedDetailItem.maintenanceQuantity || 0}
                </div>
              </div>
            </div>

            {/* Valuation & Rent Details */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Nilai Satuan:</span>
                <span className="font-mono text-white font-medium">{formatIDR(selectedDetailItem.price || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Valuasi Aset ({selectedDetailItem.quantity} unit):</span>
                <span className="font-mono text-white font-semibold">
                  {formatIDR((selectedDetailItem.price || 0) * (selectedDetailItem.quantity || 0))}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium pt-1.5 border-t border-slate-800">
                <span>Rate Biaya Sewa ({selectedDetailItem.rentPercentage || 1}% per hari):</span>
                <span className="font-mono">
                  {formatIDR((selectedDetailItem.price || 0) * ((selectedDetailItem.rentPercentage || 1) / 100))}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Tutup
              </button>
              <a
                href={`${ERP_URL}?search=${encodeURIComponent(selectedDetailItem.code || selectedDetailItem.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>Buka Detail di ERP Logistik</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
