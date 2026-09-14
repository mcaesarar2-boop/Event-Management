'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Event, EventStatus, HealthStatus } from '@/lib/types';
import { formatDate, calculateDaysUntil, formatCompactIDR } from '@/lib/utils/format';

export type EventTabType =
  | 'OVERVIEW'
  | 'TIMELINE'
  | 'BUDGET'
  | 'TALENT'
  | 'PROCUREMENT'
  | 'REVENUE'
  | 'SPONSORSHIP'
  | 'PLANNING'
  | 'RUNDOWN'
  | 'CREW'
  | 'LOGISTICS_ERP'
  | 'RISKS'
  | 'DOCUMENTS'
  | 'PAYMENTS'
  | 'REPORTS';

interface EventDetailHeaderProps {
  event: Event;
  activeTab: EventTabType;
  onSelectTab: (tab: EventTabType) => void;
  onBackToGlobal: () => void;
  onUpdateStatus: (newStatus: EventStatus) => void;
  health: { score: number; status: HealthStatus; reasons: string[] };
  onDeleteEvent?: (id: string) => void;
}

export function EventDetailHeader({
  event,
  activeTab,
  onSelectTab,
  onBackToGlobal,
  onUpdateStatus,
  health,
  onDeleteEvent,
}: EventDetailHeaderProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const toggleStatusMenu = () => {
    if (showStatusMenu) {
      setShowStatusMenu(false);
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:dropdown-opened', { detail: { source: 'event-status-menu' } }));
      }
      setShowStatusMenu(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    const handleGlobalDropdownOpened = (e: unknown) => {
      const customEvent = e as CustomEvent<{ source?: string }>;
      if (customEvent.detail?.source !== 'event-status-menu') {
        setShowStatusMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('app:dropdown-opened', handleGlobalDropdownOpened);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('app:dropdown-opened', handleGlobalDropdownOpened);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const daysUntilEvent = calculateDaysUntil(event.eventDayDate || event.startDate);
  const daysUntilLoadIn = calculateDaysUntil(event.loadInDate);

  const statuses: EventStatus[] = [
    'DRAFT',
    'PROPOSAL',
    'CONFIRMED',
    'PRE_PRODUCTION',
    'PRODUCTION',
    'LIVE',
    'COMPLETED',
    'SETTLEMENT',
    'ARCHIVED',
  ];

  const tabs: Array<{ id: EventTabType; label: string; badge?: string; badgeColor?: string }> = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'TIMELINE', label: 'Timeline & Milestones' },
    { id: 'BUDGET', label: 'Budget & Variance' },
    { id: 'TALENT', label: 'Talent & Riders' },
    { id: 'PROCUREMENT', label: 'Vendors & POs' },
    { id: 'REVENUE', label: 'Revenue' },
    { id: 'SPONSORSHIP', label: 'Sponsorship' },
    { id: 'PLANNING', label: 'Tasks & Checklist' },
    { id: 'RUNDOWN', label: 'Master Rundown' },
    { id: 'CREW', label: 'Crew Roster' },
    {
      id: 'LOGISTICS_ERP',
      label: 'ERP Logistics Hub',
      badge: 'mcaesarar2-boop',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-800',
    },
    { id: 'RISKS', label: 'Risk Register' },
    { id: 'DOCUMENTS', label: 'Documents' },
    { id: 'PAYMENTS', label: 'Cashflow & Approvals' },
    { id: 'REPORTS', label: 'Reports & P&L' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 -mx-4 -mt-4 px-4 sm:px-6 pt-4 pb-0 space-y-4">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToGlobal}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Events Portfolio</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Health Score Pill */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              health.status === 'HEALTHY'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                : health.status === 'WARNING'
                ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
            }`}
            title={health.reasons.join('\n')}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health.status === 'HEALTHY'
                  ? 'bg-emerald-400'
                  : health.status === 'WARNING'
                  ? 'bg-amber-400'
                  : 'bg-rose-400 animate-pulse'
              }`}
            ></span>
            <span>Health {health.score}/100</span>
            <span className="text-[10px] opacity-80">({health.status})</span>
          </div>

          {/* Status Dropdown */}
          <div ref={statusMenuRef} className="relative">
            <button
              onClick={toggleStatusMenu}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-750 transition"
            >
              <span>Status: {event.status}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                  Update Stage
                </div>
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatus(st);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      event.status === st ? 'text-indigo-400 font-bold bg-slate-800/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{st}</span>
                    {event.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete Event Button */}
          {onDeleteEvent && (
            <div>
              {isConfirmingDelete ? (
                <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800 rounded-md p-0.5">
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  title="Hapus event ini"
                  className="p-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-800/60 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Title Banner & Key Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-semibold">
              {event.code}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">{event.type}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">{event.clientName}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Event Date: <strong className="text-slate-200">{formatDate(event.eventDayDate || event.startDate)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.venueName}, {event.city}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Target: <strong className="text-slate-200">{event.expectedAttendance.toLocaleString()}</strong> attendees</span>
            </div>
          </div>
        </div>

        {/* Countdown Tickers */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-lg text-center min-w-[100px]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Event Day
            </div>
            <div className="text-sm font-bold text-indigo-300 font-mono">
              {daysUntilEvent.label}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-lg text-center min-w-[100px]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Load In
            </div>
            <div className="text-sm font-bold text-amber-300 font-mono">
              {daysUntilLoadIn.label}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-lg text-center min-w-[100px]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Budget Cap
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {formatCompactIDR(event.totalBudget)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-t border-slate-800 pt-1 overflow-x-auto no-scrollbar touch-scroll">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                    tab.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
