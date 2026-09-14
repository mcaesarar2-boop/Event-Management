'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { Event, UserAccount } from '@/lib/types';
import { formatCompactIDR } from '@/lib/utils/format';

interface HeaderProps {
  events: Event[];
  selectedEventId?: string;
  onSelectEvent: (eventId: string | undefined) => void;
  onOpenNewEventModal: () => void;
  onOpenSearchModal: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  onOpenMobileSidebar?: () => void;
}

export function Header({
  events,
  selectedEventId,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenSearchModal,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenMobileSidebar,
}: HeaderProps) {
  // Single active dropdown state ensures mutual exclusivity inside Header
  const [activeDropdown, setActiveDropdown] = useState<'EVENT' | 'NOTIF' | 'USER' | null>(null);

  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  const toggleDropdown = (type: 'EVENT' | 'NOTIF' | 'USER') => {
    if (activeDropdown === type) {
      setActiveDropdown(null);
    } else {
      // Notify other components (e.g. EventDetailHeader) to close their dropdowns
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:dropdown-opened', { detail: { source: `header-${type}` } }));
      }
      setActiveDropdown(type);
    }
  };

  // Listen to outside clicks and global dropdown open events
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        eventDropdownRef.current &&
        !eventDropdownRef.current.contains(target) &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(target) &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleGlobalDropdownOpened = (e: unknown) => {
      const customEvent = e as CustomEvent<{ source?: string }>;
      // If the event came from outside this header, close any active header dropdown
      if (!customEvent.detail?.source?.startsWith('header-')) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
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

  const showEventDropdown = activeDropdown === 'EVENT';
  const showNotifications = activeDropdown === 'NOTIF';
  const showUserMenu = activeDropdown === 'USER';

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Dynamic notification items
  const notifications = [
    {
      id: 'notif-1',
      type: 'WARNING',
      title: 'Budget Overrun Warning',
      message: 'Pos LED Screen (CVM) mengalami over-budget Rp 15.000.000 pada event UGM Festival.',
      time: '10m lalu',
      linkText: 'Review Budget',
    },
    {
      id: 'notif-2',
      type: 'CRITICAL',
      title: 'Payment Due in 5 Days',
      message: 'Pelunasan Sheila On 7 sebesar Rp 225.000.000 jatuh tempo 10 Mei.',
      time: '1j lalu',
      linkText: 'Check Payment',
    },
    {
      id: 'notif-3',
      type: 'INFO',
      title: 'ERP Logistics Reserved',
      message: 'L-Acoustics K2 & Subwoofer telah di-reserve oleh ERP Logistik dari Gudang Cakung.',
      time: '3j lalu',
      linkText: 'View Requirements',
    },
  ];

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between z-20 select-none">
      {/* Left: Hamburger (mobile) & Event Scope Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div ref={eventDropdownRef} className="relative">
          <button
            id="event-scope-btn"
            onClick={() => toggleDropdown('EVENT')}
            className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 hover:bg-slate-800 transition font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="max-w-[130px] sm:max-w-[220px] truncate">
              {selectedEvent ? selectedEvent.name : 'All Events (Global)'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1 flex-shrink-0" />
          </button>

          {showEventDropdown && (
            <div className="absolute left-0 mt-1.5 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Select Active Event Context
              </div>
              <button
                onClick={() => {
                  onSelectEvent(undefined);
                  closeAllDropdowns();
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${
                  !selectedEventId ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>🌍 Global Enterprise View (All Events)</span>
                {!selectedEventId && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <div className="max-h-60 overflow-y-auto">
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onSelectEvent(evt.id);
                      closeAllDropdowns();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-800/60 transition ${
                      selectedEventId === evt.id ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{evt.name}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400 ml-1">
                        {evt.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                      <span>{evt.city} • {evt.type}</span>
                      <span>{formatCompactIDR(evt.totalBudget)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedEvent && (
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-400">•</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              {selectedEvent.code}
            </span>
            <span className="text-slate-400">{selectedEvent.venueName}</span>
          </div>
        )}
      </div>

      {/* Center: Global Search trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          id="global-search-trigger"
          onClick={onOpenSearchModal}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300 transition"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search events, artists, vendors, contracts, POs...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Create Event Button */}
        <button
          id="btn-create-event-top"
          onClick={onOpenNewEventModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
        </button>

        {/* Notification Bell */}
        <div ref={notifDropdownRef} className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => toggleDropdown('NOTIF')}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-xs">
                <span className="font-semibold text-slate-200">Alerts & System Notifications</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded">
                  3 Active
                </span>
              </div>
              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 text-xs hover:bg-slate-800/50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        {n.type === 'CRITICAL' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        ) : n.type === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        )}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-800 text-center">
                <span
                  onClick={closeAllDropdowns}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  View all system logs & alerts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div ref={userDropdownRef} className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => toggleDropdown('USER')}
            className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-[11px] leading-tight pr-1">
              <div className="font-semibold text-slate-200 truncate max-w-[100px]">{currentUser.name}</div>
              <div className="text-[9px] text-indigo-400 font-mono">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-800">
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded">
                    Active Role: {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simulate Role / Switch User (RBAC Test)
              </div>
              <div className="max-h-56 overflow-y-auto">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      closeAllDropdowns();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${
                      currentUser.id === u.id ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.role} • {u.department}</div>
                    </div>
                    {currentUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
