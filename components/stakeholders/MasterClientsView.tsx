'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Client, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface MasterClientsViewProps {
  clients: Client[];
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onCreateClient?: (client: Omit<Client, 'id' | 'totalEvents' | 'activeEvents' | 'completedEvents' | 'totalRevenue' | 'outstandingReceivable'>) => void;
}

export function MasterClientsView({
  clients,
  events,
  onSelectEvent,
}: MasterClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);

  const filteredClients = clients.filter((c) =>
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalContractedClients = clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
  const totalOutstandingClients = clients.reduce((sum, c) => sum + (c.outstandingReceivable || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            COMMERCIAL CRM & ACCOUNT MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients CRM & Account Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Database korporasi, brand sponsor, promotor rekanan, portofolio event terselenggara, dan piutang proyek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            {clients.length} Akun Klien Terdaftar
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Klien Korporat & Brand</div>
          <div className="text-2xl font-bold text-white font-mono">{clients.length} Klien</div>
          <div className="text-xs text-indigo-400 mt-1">Teknologi, FMCG, Otomotif, Finansial</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Nilai Kontrak Seluruh Klien</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{formatIDR(totalContractedClients)}</div>
          <div className="text-xs text-slate-400 mt-1">Akumulasi Revenue Proyek Event</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Piutang Proyek Klien</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{formatIDR(totalOutstandingClients)}</div>
          <div className="text-xs text-slate-400 mt-1">Invoice Pending / Menunggu Termin</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari perusahaan, kontak person, atau industri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientEvents = events.filter((e) => e.clientId === client.id || e.clientName === client.company);
          const isSelected = selectedClient?.id === client.id;

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-base leading-tight">{client.company}</div>
                    <div className="text-xs text-indigo-400 mt-0.5">{client.industry || 'Corporate'}</div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    {clientEvents.length} Event
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>{client.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Nilai Proyek</div>
                    <div className="font-mono font-bold text-emerald-400">{formatIDR(client.totalRevenue || 0)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Sisa Piutang</div>
                    <div className="font-mono font-bold text-amber-400">{formatIDR(client.outstandingReceivable || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Event Links */}
              {clientEvents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5">Event Klien Ini:</div>
                  <div className="space-y-1">
                    {clientEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev.id);
                        }}
                        className="flex items-center justify-between p-1.5 rounded bg-slate-950 hover:bg-indigo-950/40 border border-slate-800/60 text-xs text-slate-300 hover:text-white transition group"
                      >
                        <span className="truncate font-medium">{ev.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
