'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Calendar,
  MapPin,
  FileText,
  Sliders,
  Volume2,
  Sun,
  Video,
  Zap,
  Layers,
  Music,
  Truck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

export interface SupabaseItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  quantity: number;
  status: string;
  imageUrl: string | null;
  maintenanceQuantity: number | null;
  rentedQuantity: number | null;
  Category?: Array<{ id: string; name: string }>;
}

interface InventoryItemPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllocate: (itemData: {
    itemReference: string;
    category: string;
    quantity: number;
    unit: string;
    requiredDate: string;
    returnDate: string;
    sku?: string;
    imageUrl?: string;
    placementArea?: string;
    notes?: string;
    sourceItemId?: string;
  }) => void;
  defaultLoadInDate?: string;
  defaultLoadOutDate?: string;
  initialSearch?: string;
}

const CATEGORY_TABS = [
  { id: 'ALL', label: 'Semua Kategori', icon: Package },
  { id: 'AUDIO', label: 'Audio & PA', match: ['audio', 'mixer', 'speaker', 'microphone', 'pa system', 'di-box'], icon: Volume2 },
  { id: 'LIGHTING', label: 'Stage Lighting', match: ['lighting', 'moving head', 'par led', 'blinder', 'fresnel', 'follow spot', 'dimmer', 'fog'], icon: Sun },
  { id: 'VISUAL', label: 'Visual & LED', match: ['led-wall', 'video', 'camera', 'switcher', 'projector', 'monitor'], icon: Video },
  { id: 'POWER', label: 'Power & Genset', match: ['power', 'generator', 'distro'], icon: Zap },
  { id: 'RIGGING', label: 'Rigging & Truss', match: ['truss', 'engine', 'crane', 'stage', 'utilities'], icon: Layers },
  { id: 'BACKLINE', label: 'Backline & Instrument', match: ['backline', 'instrument', 'drum', 'keyboard', 'piano', 'amplifier'], icon: Music },
];

const PLACEMENT_OPTIONS = [
  'Main Stage',
  'FOH (Front of House)',
  'Stage Left',
  'Stage Right',
  'Backstage / Green Room',
  'VIP Lounge / Hospitality',
  'Broadcast / Streaming Room',
  'Genset Station / Power Hub',
  'Loading Dock',
];

export function InventoryItemPickerModal({
  isOpen,
  onClose,
  onAllocate,
  defaultLoadInDate,
  defaultLoadOutDate,
  initialSearch = '',
}: InventoryItemPickerModalProps) {
  const [items, setItems] = useState<SupabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  // Allocation Form state for selected item
  const [selectedItem, setSelectedItem] = useState<SupabaseItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unit');
  const [placementArea, setPlacementArea] = useState('Main Stage');
  const [loadInDate, setLoadInDate] = useState(defaultLoadInDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [loadOutDate, setLoadOutDate] = useState(defaultLoadOutDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync initialSearch if prop changes
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Fetch Supabase Items on mount
  const fetchItems = async () => {
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
          Category(id, name)
        `)
        .order('name', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }
      setItems((data as SupabaseItem[]) || []);
    } catch (err: any) {
      console.error('Failed to load Supabase items:', err);
      setError(err.message || 'Gagal memuat inventaris gudang Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // When user selects an item from the list
  const handleSelectItem = (item: SupabaseItem) => {
    setSelectedItem(item);
    setQuantity(1);

    // Auto-detect sensible unit based on category/name
    const lowerName = item.name.toLowerCase();
    const catNames = item.Category?.map((c) => c.name.toLowerCase()).join(' ') || '';
    if (lowerName.includes('cable') || lowerName.includes('kabel')) {
      setUnit('roll');
    } else if (lowerName.includes('led') || catNames.includes('led-wall')) {
      setUnit('panel');
    } else if (lowerName.includes('console') || lowerName.includes('mixer')) {
      setUnit('flight-case');
    } else if (catNames.includes('speaker') || lowerName.includes('box')) {
      setUnit('box');
    } else {
      setUnit('unit');
    }

    // Default placement suggestions based on category
    if (catNames.includes('audio') || catNames.includes('mixer')) {
      setPlacementArea('FOH (Front of House)');
    } else if (catNames.includes('power') || catNames.includes('generator')) {
      setPlacementArea('Genset Station / Power Hub');
    } else if (catNames.includes('backline') || catNames.includes('instrument') || catNames.includes('drum')) {
      setPlacementArea('Main Stage');
    } else {
      setPlacementArea('Main Stage');
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.Category?.some((c) => c.name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 2. Category tab match
      if (activeCategoryTab !== 'ALL') {
        const tab = CATEGORY_TABS.find((t) => t.id === activeCategoryTab);
        if (tab && tab.match) {
          const itemCategories = item.Category?.map((c) => c.name.toLowerCase()) || [];
          const matchesCat = tab.match.some((keyword) =>
            itemCategories.some((c) => c.includes(keyword)) || item.name.toLowerCase().includes(keyword)
          );
          if (!matchesCat) return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, activeCategoryTab]);

  // Compute available stock for an item
  const getAvailableStock = (item: SupabaseItem) => {
    const total = item.quantity || 0;
    const rented = item.rentedQuantity || 0;
    const maint = item.maintenanceQuantity || 0;
    return Math.max(0, total - rented - maint);
  };

  const handleConfirmAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Detect high level category for grouping in event logistics
    const primaryCat = selectedItem.Category?.[0]?.name || 'Production';
    let mappedCategory = 'SOUND';
    const catStr = (primaryCat + ' ' + selectedItem.name).toLowerCase();
    if (catStr.includes('light') || catStr.includes('par led') || catStr.includes('moving head') || catStr.includes('fresnel') || catStr.includes('fog')) {
      mappedCategory = 'LIGHTING';
    } else if (catStr.includes('led') || catStr.includes('video') || catStr.includes('camera') || catStr.includes('switcher')) {
      mappedCategory = 'LED_VIDEO';
    } else if (catStr.includes('power') || catStr.includes('generator') || catStr.includes('distro')) {
      mappedCategory = 'POWER_GENSET';
    } else if (catStr.includes('truss') || catStr.includes('rigging') || catStr.includes('crane') || catStr.includes('stage')) {
      mappedCategory = 'STAGE_RIGGING';
    } else if (catStr.includes('backline') || catStr.includes('instrument') || catStr.includes('drum') || catStr.includes('guitar') || catStr.includes('bass') || catStr.includes('keyboard') || catStr.includes('piano')) {
      mappedCategory = 'BACKLINE';
    } else if (catStr.includes('audio') || catStr.includes('speaker') || catStr.includes('mixer') || catStr.includes('mic')) {
      mappedCategory = 'SOUND';
    }

    onAllocate({
      itemReference: selectedItem.name,
      category: mappedCategory,
      quantity: Number(quantity),
      unit,
      requiredDate: loadInDate,
      returnDate: loadOutDate,
      sku: selectedItem.code,
      imageUrl: selectedItem.imageUrl || undefined,
      placementArea,
      notes: notes.trim() || undefined,
      sourceItemId: selectedItem.id,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden cursor-default text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Katalog Gudang & Alokasi Alat
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Supabase Live ({items.length} SKUs)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pilih peralatan langsung dari inventaris gudang pusat untuk dialokasikan ke panggung event.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchItems}
              title="Refresh Data Supabase"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Pills Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama alat, SKU (misal: AUD-MC-001), merk, atau kategori..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              autoFocus
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

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (Grid Split: Items List on Left, Allocation Form on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Items List */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 h-full overflow-hidden">
            <div className="px-4 py-2 bg-slate-950/40 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex justify-between items-center">
              <span>Menampilkan {filteredItems.length} barang inventaris</span>
              {selectedItem && (
                <span className="text-indigo-400">1 barang dipilih: {selectedItem.name}</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-xs">Memuat katalog alat Supabase...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <div>
                    <div className="font-semibold">Koneksi Supabase Terkendala</div>
                    <div className="text-[11px] text-rose-400/80 mt-0.5">{error}</div>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Package className="w-10 h-10 stroke-1" />
                  <p className="text-xs">Tidak ditemukan alat yang cocok dengan pencarian.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategoryTab('ALL');
                    }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Reset filter & pencarian
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const availableStock = getAvailableStock(item);
                  const isOutOfStock = availableStock <= 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`group p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Thumbnail Image */}
                        <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-6 h-6 text-slate-600" />
                          )}
                        </div>

                        {/* Title & SKU */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {item.code}
                            </span>
                            {item.Category?.[0] && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                                {item.Category[0].name}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-xs text-slate-200 truncate mt-1">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description || 'Peralatan operasional standar'}
                          </div>
                        </div>
                      </div>

                      {/* Stock & Select Pill */}
                      <div className="flex flex-col items-end flex-shrink-0 text-right">
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isOutOfStock
                              ? 'bg-rose-950/60 text-rose-400 border-rose-800/80'
                              : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                          }`}
                        >
                          {availableStock} Ready
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          Total {item.quantity} unit
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Allocation Form */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950/30 h-full overflow-y-auto">
            <div className="px-4 py-2 bg-slate-950/60 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
              Detail Alokasi ke Event
            </div>

            {selectedItem ? (
              <form onSubmit={handleConfirmAllocate} className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Selected Item Card Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-900/60 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {selectedItem.imageUrl ? (
                        <img
                          src={selectedItem.imageUrl}
                          alt={selectedItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono text-indigo-400 font-semibold">
                        {selectedItem.code}
                      </div>
                      <div className="font-bold text-xs text-slate-100 truncate">
                        {selectedItem.name}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        Stok Tersedia: {getAvailableStock(selectedItem)} unit di Gudang
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Unit Stepper */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Jumlah Dibutuhkan *
                      </label>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          required
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-full text-center bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none py-1.5"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Satuan Unit *
                      </label>
                      <input
                        type="text"
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="e.g. unit, box, panel"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Placement Area */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lokasi Penempatan di Panggung / Venue *</span>
                    </label>
                    <select
                      value={placementArea}
                      onChange={(e) => setPlacementArea(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {PLACEMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates: Load-in & Load-out */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>Tgl Load-in *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={loadInDate}
                        onChange={(e) => setLoadInDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>Tgl Load-out *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={loadOutDate}
                        onChange={(e) => setLoadOutDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Notes / Catatan Teknis */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span>Catatan Teknis & Aksesoris Tambahan</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Sertakan clamp rigging, kabel snake 50m, dan isolated ground audio"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                  >
                    Batal Pilih
                  </button>

                  <button
                    type="submit"
                    disabled={submitSuccess}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-lg ${
                      submitSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {submitSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Berhasil Dialokasikan!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Tambahkan ke Kebutuhan Event</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                <Sliders className="w-10 h-10 stroke-1 text-slate-600" />
                <div className="font-semibold text-xs text-slate-300">
                  Pilih Alat dari Daftar Sebelah Kiri
                </div>
                <p className="text-[11px] max-w-xs">
                  Klik salah satu barang inventaris untuk menentukan jumlah unit, tanggal load-in, lokasi penempatan, dan catatan teknis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

