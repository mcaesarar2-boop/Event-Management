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
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  Layers,
  ExternalLink,
  Menu,
  X,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Event, UserAccount, NotificationItem } from '@/lib/types';
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
  notifications?: NotificationItem[];
  onNotificationClick?: (notif: NotificationItem) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onViewAllLogs?: () => void;
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
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onViewAllLogs,
}: HeaderProps) {
  const router = useRouter();
  // Single active dropdown state ensures mutual exclusivity inside Header
  const [activeDropdown, setActiveDropdown] = useState<'EVENT' | 'NOTIF' | 'USER' | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const supabase = createBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setSupabaseUser(data.user);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSupabaseUser(session?.user || null);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Failed to initialize Supabase auth listener:', err);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

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

  // Notification State & Filtering
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const notifItems = notifications;
  const unreadCount = notifItems.filter((n) => !n.read).length;
  const filteredNotifications = notifFilter === 'UNREAD'
    ? notifItems.filter((n) => !n.read)
    : notifItems;

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
            className={`p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition relative ${
              showNotifications ? 'bg-slate-800 text-slate-200' : ''
            }`}
            aria-label="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-slate-900 shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
              {/* Header Title & Actions */}
              <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 text-xs">Pusat Notifikasi & Alert</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      unreadCount > 0
                        ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {unreadCount > 0 ? `${unreadCount} Belum Dibaca` : 'Semua Terbaca'}
                  </span>
                </div>

                {unreadCount > 0 && onMarkAllNotificationsAsRead && (
                  <button
                    onClick={() => onMarkAllNotificationsAsRead()}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition font-medium hover:underline cursor-pointer"
                    title="Tandai semua notifikasi telah dibaca"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Semua Dibaca</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center px-3.5 py-1.5 bg-slate-950/50 border-b border-slate-800/80 gap-2">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition font-medium ${
                    notifFilter === 'ALL'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Semua ({notifItems.length})
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                    notifFilter === 'UNREAD'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span>Belum Dibaca</span>
                  {unreadCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  )}
                </button>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-slate-800/70 max-h-[380px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-slate-300">
                      {notifFilter === 'UNREAD' ? 'Tidak Ada Notifikasi Baru' : 'Belum Ada Alert Aktif'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      {notifFilter === 'UNREAD'
                        ? 'Semua notifikasi dan alert penting telah Anda tinjau.'
                        : 'Semua timeline produksi, anggaran, dan logistik berjalan normal.'}
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    const isCritical = n.severity === 'CRITICAL';
                    const isWarning = n.severity === 'WARNING';
                    const isSuccess = n.severity === 'SUCCESS';

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          closeAllDropdowns();
                          onNotificationClick?.(n);
                        }}
                        className={`p-3 text-xs transition cursor-pointer group relative border-l-2 ${
                          !n.read
                            ? 'bg-indigo-950/20 hover:bg-indigo-950/40 border-l-indigo-500'
                            : 'hover:bg-slate-800/50 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-semibold">
                            {isCritical ? (
                              <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            ) : isWarning ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            ) : isSuccess ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            )}
                            <span
                              className={`transition ${
                                !n.read
                                  ? isCritical
                                    ? 'text-rose-200 font-bold'
                                    : isWarning
                                    ? 'text-amber-200 font-bold'
                                    : 'text-white font-bold'
                                  : 'text-slate-200 group-hover:text-white'
                              }`}
                            >
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" title="Belum dibaca"></span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono">{n.createdAt}</span>
                            {onDeleteNotification && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(n.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                                title="Hapus notifikasi"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed pl-5.5">
                          {n.message}
                        </p>

                        <div className="mt-2 pl-5.5 flex flex-wrap items-center justify-between gap-2">
                          {n.eventName ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono truncate max-w-[220px]">
                              🏷️ {n.eventName}
                            </span>
                          ) : (
                            <span></span>
                          )}

                          {n.action && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all">
                              {n.action.label}
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-slate-800 text-center bg-slate-900/90">
                <button
                  onClick={() => {
                    closeAllDropdowns();
                    onViewAllLogs?.();
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1.5 font-medium transition cursor-pointer"
                >
                  <span>Buka Semua Log Aktivitas & Audit Sistem</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher & Profile Menu */}
        {(() => {
          const displayName = supabaseUser?.user_metadata?.full_name ||
            supabaseUser?.user_metadata?.name ||
            (supabaseUser?.email ? supabaseUser.email.split('@')[0] : currentUser.name);
          const displayEmail = supabaseUser?.email || currentUser.email;
          const displayAvatar = (displayName || 'U').charAt(0).toUpperCase();

          return (
            <div ref={userDropdownRef} className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => toggleDropdown('USER')}
                className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {displayAvatar}
                </div>
                <div className="hidden lg:block text-left text-[11px] leading-tight pr-1">
                  <div className="font-semibold text-slate-200 truncate max-w-[120px]" title={displayName}>
                    {displayName}
                  </div>
                  <div className="text-[9px] text-indigo-400 font-mono">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="text-xs font-semibold text-slate-200">{displayName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{displayEmail}</div>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded">
                        Active Role: {currentUser.role}
                      </span>
                      {supabaseUser && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Supabase Auth
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Role / Switch User (RBAC Test)
                  </div>
                  <div className="max-h-52 overflow-y-auto">
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

                  {/* Logout Button */}
                  <div className="p-2 mt-1 border-t border-slate-800 bg-slate-900/90">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full py-1.5 px-3 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? 'Sedang keluar...' : 'Keluar / Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </header>
  );
}
