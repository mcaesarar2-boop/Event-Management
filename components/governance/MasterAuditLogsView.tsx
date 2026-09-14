'use client';

import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  UserCheck,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { AuditLogItem, UserAccount } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface MasterAuditLogsViewProps {
  auditLogs: AuditLogItem[];
  users: UserAccount[];
  currentUser: UserAccount;
}

export function MasterAuditLogsView({
  auditLogs,
  users,
  currentUser,
}: MasterAuditLogsViewProps) {
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'LOGS' | 'RBAC'>('LOGS');

  const actions = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'STATUS_CHANGE'];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.eventName && log.eventName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            SECURITY, COMPLIANCE & AUDIT TRAIL
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail & RBAC Matrix</h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable system logs: pencatatan setiap perubahan anggaran, approval PO, perubahan status task, dan matriks hak akses tim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'LOGS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Audit Log Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('RBAC')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'RBAC'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            RBAC Roles Matrix ({users.length} Users)
          </button>
        </div>
      </div>

      {/* AUDIT LOGS TAB */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Cari user, aktivitas entitas, atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar w-full md:w-auto pb-1 md:pb-0">
              {actions.map((act) => (
                <button
                  key={act}
                  onClick={() => setActionFilter(act)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    actionFilter === act
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {act === 'ALL' ? 'Semua Action' : act}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Log Aktivitas Pengguna Terverifikasi</h2>
                <p className="text-xs text-slate-400 mt-0.5">Setiap mutasi data tersimpan permanen dengan identitas user dan timestamp.</p>
              </div>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs text-slate-300 min-w-[780px]">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Waktu & Tanggal</th>
                    <th className="py-3.5 px-4 font-semibold">User & Role</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                    <th className="py-3.5 px-4 font-semibold">Entitas & Target</th>
                    <th className="py-3.5 px-4 font-semibold">Event Terkait</th>
                    <th className="py-3.5 px-4 font-semibold">Deskripsi Perubahan / Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-white">{log.userName}</div>
                        <div className="text-[10px] text-indigo-400 font-mono">{log.userRole}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.action === 'APPROVE'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : log.action === 'UPDATE' || log.action === 'STATUS_CHANGE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        <span className="font-mono text-indigo-300">[{log.entity}]</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans truncate max-w-[150px]">
                        {log.eventName || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans max-w-sm">
                        {log.notes || (log.previousValue && log.newValue ? `${log.previousValue} -> ${log.newValue}` : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RBAC MATRIX TAB */}
      {activeTab === 'RBAC' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Matriks Hak Akses Pengguna (Role-Based Access Control)</h2>
            <p className="text-xs text-slate-400 mt-1">
              Hierarki kewenangan peran untuk membatasi aksi pengeluaran biaya, approval PO, pembatalan event, dan akses audit log.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-200">
                    {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Role Sistem:</span>
                  <span className="font-mono text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/40 text-[11px]">
                    {u.role}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5">Kewenangan Akses:</div>
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
