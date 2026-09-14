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
  X,
  UploadCloud,
} from 'lucide-react';
import { DocumentItem, Event } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface EventDocumentsTabProps {
  event: Event;
  documents: DocumentItem[];
  onCreateDocument: (doc: Omit<DocumentItem, 'id'>) => void;
}

export function EventDocumentsTab({
  event,
  documents,
  onCreateDocument,
}: EventDocumentsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('Permits & Licensing');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [status, setStatus] = useState<DocumentItem['status']>('Verified');

  const categories: Array<DocumentItem['category']> = [
    'Contract & Agreement',
    'Permits & Licensing',
    'Technical Rider & Stage Plot',
    'Floor Plan & CAD Layout',
    'Insurance & Safety',
    'Invoice & Tax Faktur',
    'Marketing Collateral',
    'Post-Event Report',
  ];

  const filteredDocs = selectedCategory === 'ALL'
    ? documents
    : documents.filter((d) => d.category === selectedCategory);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateDocument({
      eventId: event.id,
      name,
      category,
      fileUrl: '#',
      fileSize,
      fileType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Legal & Operations Desk',
      status,
    });

    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            Documents Vault, Legal Contracts & Permits Repository
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Izin Keramaian Kepolisian, Venue agreements, Technical CAD stage plots, and All-Risk Public Liability insurance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Documents ({documents.length})
        </button>
        {categories.map((cat) => {
          const count = documents.filter((d) => d.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-900/60 text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    doc.status === 'Verified'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : doc.status === 'Pending Review'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">{doc.name}</h3>
                <p className="text-[11px] text-indigo-400 font-medium mt-1">{doc.category}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="font-mono text-[11px]">
                <span>{doc.fileType}</span> &middot; <span>{doc.fileSize}</span>
              </div>

              <button
                onClick={() => alert(`Simulating download for: ${doc.name}`)}
                className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
            No documents found in this category.
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Attach Event Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Document Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Surat Rekomendasi Satgas COVID & Izin Polda DIY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentItem['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">File Extension</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DWG">DWG (AutoCAD)</option>
                    <option value="XLSX">XLSX (Spreadsheet)</option>
                    <option value="DOCX">DOCX (Word)</option>
                    <option value="ZIP">ZIP Archive</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Verification Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DocumentItem['status'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                  </select>
                </div>
              </div>

              <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-950/50">
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-300">Drop files here or click to browse</div>
                <div className="text-[10px] text-slate-400 mt-1">Accepts PDF, DWG, XLSX up to 50MB</div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Attach Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
