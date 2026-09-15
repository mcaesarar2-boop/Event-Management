'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  CheckCircle2,
  Phone,
  User,
  Star,
  Search,
  FileText,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { ArtistRiderGearItem, Vendor } from '@/lib/types';

interface VendorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gearItem: ArtistRiderGearItem | null;
  artistName: string;
  vendors: Vendor[];
  onConfirm: (data: { vendorId: string; vendorName: string; notes: string }) => void;
}

export function VendorAssignmentModal({
  isOpen,
  onClose,
  gearItem,
  artistName,
  vendors = [],
  onConfirm,
}: VendorAssignmentModalProps) {
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (gearItem) {
      setSelectedVendorId(gearItem.vendorId || vendors[0]?.id || '');
      setNotes(gearItem.notes || '');
      setVendorSearch('');
    }
  }, [gearItem, vendors]);

  if (!isOpen || !gearItem) return null;

  // Filter vendors
  const filteredVendors = vendors.filter((v) => {
    const q = vendorSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.company.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q)
    );
  });

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || filteredVendors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    onConfirm({
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.company || selectedVendor.name,
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
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Penugasan Vendor Rekanan Eksternal
              </h3>
              <p className="text-[11px] text-slate-400">
                Pengadaan alat non-gudang untuk rider <strong>{artistName}</strong>
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
          {/* Gear Info Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/60 flex-shrink-0 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                Kebutuhan Alat Eksternal
              </div>
              <div className="font-bold text-xs text-slate-100 truncate">{gearItem.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Pilih vendor spesialis audio / staging untuk memenuhi spesifikasi ini
              </div>
            </div>
          </div>

          {/* Search / Select Vendor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Pilih Vendor Rekanan Terdaftar *
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Cari nama vendor rekanan (e.g. SAV Mandiri, Mata Elang)..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Vendor List / Dropdown Selection */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-1.5">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => {
                  const isSelected = selectedVendor?.id === vendor.id;
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedVendorId(vendor.id)}
                      className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-100 truncate">{vendor.company}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{vendor.category}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1">
                            <User className="w-2.5 h-2.5" /> {vendor.contactPerson}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          ★ {vendor.rating}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  Tidak ada vendor yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </div>

          {/* Selected Vendor Preview Card */}
          {selectedVendor && (
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs space-y-1.5">
              <div className="font-semibold text-cyan-300 flex items-center justify-between">
                <span>Detail Vendor Terpilih:</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300">
                  {selectedVendor.category}
                </span>
              </div>
              <div className="text-slate-300 font-bold">{selectedVendor.company}</div>
              <div className="text-slate-400 text-[11px] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" /> PIC: {selectedVendor.contactPerson}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {selectedVendor.phone}
                </span>
              </div>
            </div>
          )}

          {/* Notes / Instructions for Vendor */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>Instruksi Khusus / Spesifikasi ke Vendor</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pastikan tabung tube amp sudah dites warm-up dan kabel AC power 3-pin lengkap"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
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
              disabled={!selectedVendor}
              className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Vendor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

