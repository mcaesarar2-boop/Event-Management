'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Package,
  Layers,
  Building,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ArtistRiderGearItem } from '@/lib/types';
import { createBrowserClient } from '@/lib/supabase/client';

interface SupabaseItemOption {
  id: string;
  code: string;
  name: string;
  quantity: number;
  rentedQuantity: number | null;
  maintenanceQuantity: number | null;
  imageUrl: string | null;
  categoryName?: string;
}

interface RiderGearComboboxInputProps {
  items: ArtistRiderGearItem[];
  onChange: (items: ArtistRiderGearItem[]) => void;
  label?: string;
  placeholder?: string;
}

export function RiderGearComboboxInput({
  items,
  onChange,
  label = 'Kebutuhan Audio, Panggung & Backline (Technical Rider)',
  placeholder = 'Ketik nama alat (e.g. Marshall, Yamaha, DiGiCo, Shure)...',
}: RiderGearComboboxInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [allInventory, setAllInventory] = useState<SupabaseItemOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch full Supabase inventory on mount
  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('Item')
          .select(`
            id,
            code,
            name,
            quantity,
            rentedQuantity,
            maintenanceQuantity,
            imageUrl,
            Category(name)
          `)
          .order('name', { ascending: true });

        if (!error && data && isMounted) {
          const formatted: SupabaseItemOption[] = data.map((d: any) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            quantity: d.quantity || 0,
            rentedQuantity: d.rentedQuantity || 0,
            maintenanceQuantity: d.maintenanceQuantity || 0,
            imageUrl: d.imageUrl || null,
            categoryName: Array.isArray(d.Category)
              ? d.Category.map((c: any) => c.name).filter(Boolean).join(' • ')
              : d.Category?.name || undefined,
          }));
          setAllInventory(formatted);
        }
      } catch (err) {
        console.error('Failed to load items for combobox:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced remote search to Supabase for dynamic lookup guarantee
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('Item')
          .select(`
            id,
            code,
            name,
            quantity,
            rentedQuantity,
            maintenanceQuantity,
            imageUrl,
            Category(name)
          `)
          .or(`name.ilike.%${trimmed}%,code.ilike.%${trimmed}%`)
          .limit(25);

        if (!error && data && data.length > 0) {
          setAllInventory((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newItems: SupabaseItemOption[] = [];
            data.forEach((d: any) => {
              if (!existingIds.has(d.id)) {
                newItems.push({
                  id: d.id,
                  code: d.code,
                  name: d.name,
                  quantity: d.quantity || 0,
                  rentedQuantity: d.rentedQuantity || 0,
                  maintenanceQuantity: d.maintenanceQuantity || 0,
                  imageUrl: d.imageUrl || null,
                  categoryName: Array.isArray(d.Category)
                    ? d.Category.map((c: any) => c.name).filter(Boolean).join(' • ')
                    : d.Category?.name || undefined,
                });
              }
            });
            return newItems.length > 0 ? [...prev, ...newItems] : prev;
          });
        }
      } catch (err) {
        console.error('Debounced search error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Filter matching items (smart multi-term match)
  const matchingItems = useMemo(() => {
    if (!query.trim()) {
      return allInventory.slice(0, 10);
    }
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return allInventory
      .filter((i) => {
        const target = `${i.name} ${i.code} ${i.categoryName || ''}`.toLowerCase();
        return terms.every((term) => target.includes(term));
      })
      .slice(0, 15);
  }, [allInventory, query]);

  // Add ERP Item
  const handleSelectErpItem = (item: SupabaseItemOption) => {
    // Prevent duplicate item by itemId or exact name
    const alreadyExists = items.some((i) => i.itemId === item.id || i.name.toLowerCase() === item.name.toLowerCase());
    if (alreadyExists) {
      setQuery('');
      setIsOpen(false);
      return;
    }

    const newItem: ArtistRiderGearItem = {
      id: `gear-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      isFromErp: true,
      itemId: item.id,
      itemSku: item.code,
      category: item.categoryName || 'Backline',
      status: 'PENDING_REVIEW',
      notes: '',
    };

    onChange([...items, newItem]);
    setQuery('');
    setIsOpen(false);
  };

  // Add Custom / External Gear
  const handleAddCustomGear = (customName: string) => {
    const trimmed = customName.trim();
    if (!trimmed) return;

    const alreadyExists = items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());
    if (alreadyExists) {
      setQuery('');
      setIsOpen(false);
      return;
    }

    const newItem: ArtistRiderGearItem = {
      id: `gear-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      isFromErp: false,
      status: 'PENDING_REVIEW',
      notes: 'Kebutuhan eksternal / vendor rekanan',
    };

    onChange([...items, newItem]);
    setQuery('');
    setIsOpen(false);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-2.5" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            {items.length} alat rider terdaftar
          </span>
        </label>
      )}

      {/* Input Combobox */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (matchingItems.length > 0 && query.trim()) {
                  handleSelectErpItem(matchingItems[0]);
                } else if (query.trim()) {
                  handleAddCustomGear(query);
                }
              }
            }}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-800/80 animate-in fade-in duration-150">
            {/* Header in dropdown */}
            <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
              <span>Pilih dari Inventaris Gudang (Supabase)</span>
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
            </div>

            {/* List items */}
            {matchingItems.length > 0 ? (
              matchingItems.map((item) => {
                const readyStock = Math.max(
                  0,
                  item.quantity - (item.rentedQuantity || 0) - (item.maintenanceQuantity || 0)
                );
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectErpItem(item)}
                    className="w-full text-left p-2.5 hover:bg-slate-800/70 transition flex items-center justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono text-indigo-400">{item.code}</span>
                          {item.categoryName && <span>&middot; {item.categoryName}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          readyStock > 0
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                            : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
                        }`}
                      >
                        {readyStock} Ready
                      </span>
                    </div>
                  </button>
                );
              })
            ) : query.trim() ? (
              <div className="p-3 text-center text-xs text-slate-400">
                Tidak ada barang di inventaris gudang yang cocok dengan &ldquo;{query}&rdquo;.
              </div>
            ) : null}

            {/* Fallback Option: Custom Gear (Eksternal / Vendor) */}
            {query.trim() && (
              <button
                type="button"
                onClick={() => handleAddCustomGear(query)}
                className="w-full text-left p-3 bg-indigo-950/30 hover:bg-indigo-950/60 text-indigo-300 hover:text-indigo-200 transition flex items-center justify-between text-xs border-t border-indigo-900/40"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Plus className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">
                    + Tambahkan <strong>&ldquo;{query.trim()}&rdquo;</strong> (Kebutuhan Eksternal / Vendor)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 flex-shrink-0">
                  Non-Gudang
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Gear Tag List */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((gear) => (
            <div
              key={gear.id}
              className={`flex items-center space-x-2 pl-2.5 pr-1.5 py-1 rounded-lg border text-xs transition ${
                gear.isFromErp
                  ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {gear.isFromErp ? (
                  <Package className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                ) : (
                  <Building className="w-3 h-3 text-amber-400 flex-shrink-0" />
                )}
                <span className="font-medium text-slate-100">{gear.name}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                    gear.isFromErp
                      ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700'
                      : 'bg-amber-900/60 text-amber-300 border-amber-700'
                  }`}
                >
                  {gear.isFromErp ? 'Gudang ERP' : 'Eksternal / Vendor'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(gear.id)}
                className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                title="Hapus gear dari rider"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

