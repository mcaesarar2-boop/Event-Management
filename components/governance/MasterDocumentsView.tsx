'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Download,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { DocumentItem, Event } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface MasterDocumentsViewProps {
  documents: DocumentItem[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateDocument?: (doc: Omit<DocumentItem, 'id'>) => void;
}

export function MasterDocumentsView({
  documents,
  events,
  onSelectEvent,
  onCreateDocument,
}: MasterDocumentsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'ALL',
    'Permits & Licensing',
    'Contract & Agreement',
    'Technical Rider & Stage Plot',
    'Floor Plan & CAD Layout',
    'Insurance & Safety',
    'Invoice & Tax Faktur',
    'Post-Event Report',
  ];

  const filteredDocs = documents.filter((d) => {
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const verifiedDocs = documents.filter((d) => d.status === 'Verified' || d.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            DIGITAL ASSET & LEGAL VAULT
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Documents & Contracts Vault</h1>
          <p className="text-sm text-slate-400 mt-1">
            Repositori terpusat untuk Izin Kepolisian (Polres/Mabes), Kontrak Talent, Asuransi Public Liability, CAD Stage Layout, dan Faktur Pajak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg font-semibold">
            {documents.length} Dokumen Tersimpan
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Arsip Digital</div>
          <div className="text-2xl font-bold text-white font-mono">{documents.length} File</div>
          <div className="text-xs text-indigo-400 mt-1">PDF, CAD Layout, DOCX, ZIP</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Dokumen Terverifikasi & Legal Sah</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{verifiedDocs} Berkas Sah</div>
          <div className="text-xs text-slate-400 mt-1">Telah diinspeksi Legal & Satgas</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Menunggu Tanda Tangan / Review</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {documents.length - verifiedDocs} Berkas
          </div>
          <div className="text-xs text-slate-400 mt-1">Dalam proses tandatangan / perizinan</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama berkas, uploader, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Daftar Dokumen & Legalitas Lintas Portofolio</h2>
            <p className="text-xs text-slate-400 mt-0.5">Keamanan arsip digital dengan audit trail pengunggahan.</p>
          </div>
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs text-slate-300 min-w-[780px]">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Nama Berkas & Dokumen</th>
                <th className="py-3.5 px-4 font-semibold">Kategori Legal</th>
                <th className="py-3.5 px-4 font-semibold">Event Terkait</th>
                <th className="py-3.5 px-4 font-semibold">Uploader & Tanggal</th>
                <th className="py-3.5 px-4 font-semibold text-center">Ukuran / Format</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status Legal</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc) => {
                const ev = events.find((e) => e.id === doc.eventId);
                const isVerified = doc.status === 'Verified' || doc.status === 'Approved';

                return (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        {doc.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium text-[11px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {ev?.name || 'All Events'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{doc.uploadedBy || 'System'}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(doc.uploadedAt)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {doc.fileSize} • {doc.fileType}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => alert(`Mengunduh file: ${doc.name}`)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Download Berkas"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {ev && (
                          <button
                            onClick={() => onSelectEvent(ev.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition text-[11px] font-medium"
                          >
                            Event
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
