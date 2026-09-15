'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle,
  Layers,
  Plus,
  Minus,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { ArtistRiderGearItem } from '@/lib/types';
import { createBrowserClient } from '@/lib/supabase/client';

interface InternalAllocationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  gearItem: ArtistRiderGearItem | null;
  artistName: string;
  defaultLoadInDate?: string;
  defaultLoadOutDate?: string;
  onConfirm: (data: {
    quantity: number;
    unit: string;
    loadInDate: string;
    loadOutDate: string;
    placementArea: string;
    notes: string;
  }) => void;
}

const PLACEMENT_OPTIONS = [
  'Main Stage',
  'FOH (Front of House)',
  'Stage Left',
  'Stage Right',
  'Drum Riser / Center Stage',
  'Backstage / Green Room',
  'VIP Hospitality Area',
  'Broadcast Control Room',
];

export function InternalAllocationConfirmModal({
  isOpen,
  onClose,
  gearItem,
  artistName,
  defaultLoadInDate,
  defaultLoadOutDate,
  onConfirm,
}: InternalAllocationConfirmModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unit');
  const [placementArea, setPlacementArea] = useState('Main Stage');
  const [loadInDate, setLoadInDate] = useState(defaultLoadInDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [loadOutDate, setLoadOutDate] = useState(defaultLoadOutDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Live item stock from Supabase
  const [stockInfo, setStockInfo] = useState<{
    total: number;
    available: number;
    sku: string;
    imageUrl: string | null;
  } | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  useEffect(() => {
    if (gearItem) {
      setQuantity(gearItem.quantity || 1);
      setPlacementArea(gearItem.placementArea || 'Main Stage');
      setNotes(gearItem.notes || '');

      // Load stock info if itemId or name is available
      if (gearItem.itemId) {
        setIsLoadingStock(true);
        const supabase = createBrowserClient();
        supabase
          .from('Item')
          .select('id, code, quantity, rentedQuantity, maintenanceQuantity, imageUrl')
          .eq('id', gearItem.itemId)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              const total = data.quantity || 0;
              const rented = data.rentedQuantity || 0;
              const maint = data.maintenanceQuantity || 0;
              setStockInfo({
                total,
                available: Math.max(0, total - rented - maint),
                sku: data.code,
                imageUrl: data.imageUrl,
              });
            } else {
              setStockInfo(null);
            }
            setIsLoadingStock(false);
          });
      } else if (gearItem.name) {
        setIsLoadingStock(true);
        const supabase = createBrowserClient();
        supabase
          .from('Item')
          .select('id, code, quantity, rentedQuantity, maintenanceQuantity, imageUrl')
          .ilike('name', `%${gearItem.name}%`)
          .limit(1)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!error && data) {
              const total = data.quantity || 0;
              const rented = data.rentedQuantity || 0;
              const maint = data.maintenanceQuantity || 0;
              setStockInfo({
                total,
                available: Math.max(0, total - rented - maint),
                sku: data.code,
                imageUrl: data.imageUrl,
              });
            } else {
              setStockInfo(null);
            }
            setIsLoadingStock(false);
          });
      } else {
        setStockInfo(null);
      }
    }
  }, [gearItem]);

  if (!isOpen || !gearItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      quantity: Number(quantity),
      unit,
      loadInDate,
      loadOutDate,
      placementArea,
      notes,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden cursor-default text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Konfirmasi Alokasi Gudang Internal
              </h3>
              <p className="text-[11px] text-slate-400">
                Pemeriksaan stok aktual dan jadwal load-in untuk rider <strong>{artistName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Gear Preview & Live Stock Info */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {stockInfo?.imageUrl ? (
                <img src={stockInfo.imageUrl} alt={gearItem.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {stockInfo?.sku || gearItem.itemSku || 'ERP-ITEM'}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">Inventaris Sendiri</span>
              </div>
              <div className="font-bold text-xs text-slate-100 truncate mt-1">{gearItem.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                {isLoadingStock ? (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin" /> Memeriksa stok gudang...
                  </span>
                ) : stockInfo ? (
                  <span className="text-emerald-400 font-medium">
                    Stok Ready: <strong>{stockInfo.available} unit</strong> (Total Gudang: {stockInfo.total})
                  </span>
                ) : (
                  <span>Tersedia dalam katalog inventaris</span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Kuantitas Alokasi *
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
              <label className="text-xs font-semibold text-slate-300 block mb-1">Satuan Unit *</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="unit, set, box"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Placement Area */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lokasi Penempatan Panggung *</span>
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

          {/* Schedule: Load-in & Load-out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>Tanggal Load-in *</span>
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
                <span>Tanggal Load-out *</span>
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

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-400" />
              <span>Catatan Khusus Kru Panggung / Soundman</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Siapkan kabel jack Mogami 5m & stand kokoh untuk monitor"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Alokasi Gudang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

