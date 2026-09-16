'use client';

import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Wallet,
  Music,
  ShoppingBag,
  Users,
  Building2,
  AlertTriangle,
  FileText,
  Truck,
  BarChart3,
  History,
  FolderKanban,
  CheckSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Handshake,
} from 'lucide-react';
import packageInfo from '@/package.json';

export type NavigationItem =
  | 'GLOBAL_DASHBOARD'
  | 'EVENTS'
  | 'CALENDAR'
  | 'TIMELINE'
  | 'TASKS'
  | 'RUNDOWN'
  | 'FINANCE'
  | 'VENDORS'
  | 'SPONSORSHIP'
  | 'ARTISTS'
  | 'CREW'
  | 'CLIENTS'
  | 'VENUES'
  | 'RISKS'
  | 'DOCUMENTS'
  | 'LOGISTICS_HUB'
  | 'REPORTS'
  | 'AUDIT_LOGS';

interface SidebarProps {
  currentView: NavigationItem;
  onSelectView: (view: NavigationItem) => void;
  selectedEventId?: string;
  onClearSelectedEvent?: () => void;
  activeEventsCount: number;
  pendingApprovalsCount: number;
  criticalRisksCount: number;
  logisticsQueueCount: number;
  userRole: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: NavigationItem;
  label: string;
  icon: any;
  badge: string | null;
  badgeColor?: string;
  highlight?: boolean;
}

export function Sidebar({
  currentView,
  onSelectView,
  selectedEventId,
  onClearSelectedEvent,
  activeEventsCount,
  pendingApprovalsCount,
  criticalRisksCount,
  logisticsQueueCount,
  userRole,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'CORE PLATFORM',
      items: [
        {
          id: 'GLOBAL_DASHBOARD' as NavigationItem,
          label: 'Global Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'EVENTS' as NavigationItem,
          label: 'Events Portfolio',
          icon: FolderKanban,
          badge: activeEventsCount > 0 ? `${activeEventsCount} Active` : null,
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
      ],
    },
    {
      title: 'PLANNING & OPERATIONS',
      items: [
        {
          id: 'CALENDAR' as NavigationItem,
          label: 'Master Calendar',
          icon: CalendarDays,
          badge: null,
        },
        {
          id: 'TIMELINE' as NavigationItem,
          label: 'Milestones & Gantt',
          icon: CalendarCheck,
          badge: null,
        },
        {
          id: 'TASKS' as NavigationItem,
          label: 'Tasks & Checklist',
          icon: CheckSquare,
          badge: null,
        },
      ],
    },
    {
      title: 'FINANCE & PROCUREMENT',
      items: [
        {
          id: 'FINANCE' as NavigationItem,
          label: 'Finance & Budget',
          icon: Wallet,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Approval` : null,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        },
        {
          id: 'VENDORS' as NavigationItem,
          label: 'Vendors & POs',
          icon: ShoppingBag,
          badge: null,
        },
        {
          id: 'SPONSORSHIP' as NavigationItem,
          label: 'Sponsorship & Partners',
          icon: Handshake,
          badge: null,
        },
      ],
    },
    {
      title: 'STAKEHOLDERS & TALENT',
      items: [
        {
          id: 'ARTISTS' as NavigationItem,
          label: 'Artists & Riders',
          icon: Music,
          badge: null,
        },
        {
          id: 'CREW' as NavigationItem,
          label: 'Crew Roster & Rates',
          icon: Users,
          badge: null,
        },
        {
          id: 'CLIENTS' as NavigationItem,
          label: 'Clients CRM',
          icon: Building2,
          badge: null,
        },
        {
          id: 'VENUES' as NavigationItem,
          label: 'Venues Directory',
          icon: Building2,
          badge: null,
        },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        {
          id: 'RISKS' as NavigationItem,
          label: 'Risk Register',
          icon: AlertTriangle,
          badge: criticalRisksCount > 0 ? `${criticalRisksCount} Critical` : null,
          badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        },
        {
          id: 'DOCUMENTS' as NavigationItem,
          label: 'Documents Vault',
          icon: FileText,
          badge: null,
        },
        {
          id: 'REPORTS' as NavigationItem,
          label: 'Reports & P&L',
          icon: BarChart3,
          badge: null,
        },
        {
          id: 'AUDIT_LOGS' as NavigationItem,
          label: 'Audit Trail & RBAC',
          icon: History,
          badge: null,
        },
      ],
    },
    {
      title: 'INTEGRATION LAYER',
      items: [
        {
          id: 'LOGISTICS_HUB' as NavigationItem,
          label: 'ERP Logistics Hub',
          icon: Truck,
          badge: logisticsQueueCount > 0 ? `${logisticsQueueCount} Items` : 'Ready',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
          highlight: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen text-slate-300 select-none transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
                EMS Enterprise
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                  v{packageInfo.version}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Event Management Brain</div>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      {/* Selected Event Context Pill if inside an event */}
      {selectedEventId && (
        <div className="px-3 py-2 bg-indigo-950/40 border-b border-indigo-800/40 flex items-center justify-between">
          <div className="text-xs text-indigo-300 font-medium flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            In-Event Detail View
          </div>
          {onClearSelectedEvent && (
            <button
              onClick={onClearSelectedEvent}
              className="text-[11px] text-indigo-400 hover:text-indigo-200 underline font-semibold transition"
            >
              Back to Global
            </button>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id && !selectedEventId;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id.toLowerCase()}`}
                    onClick={() => {
                      if (selectedEventId && onClearSelectedEvent) {
                        onClearSelectedEvent();
                      }
                      onSelectView(item.id);
                      if (onCloseMobile) {
                        onCloseMobile();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                    } ${item.highlight && !isActive ? 'border border-indigo-800/30 bg-indigo-950/20' : ''}`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role & Integration Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">{userRole}</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1 rounded">
            RBAC OK
          </span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center justify-between">
          <span>Target ERP:</span>
          <span className="font-mono text-[10px] text-indigo-400 truncate max-w-[120px]" title="mcaesarar2-boop/erp-logistik">
            erp-logistik
          </span>
        </div>
      </div>
    </aside>
  </>
  );
}
