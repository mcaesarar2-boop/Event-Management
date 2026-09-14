'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/store';
import {
  Event,
  EventStatus,
  UserAccount,
  BudgetItem,
  Artist,
  PurchaseOrder,
  RevenueItem,
  Task,
  RundownItem,
  CrewAssignment,
  EventRequirement,
  RiskItem,
  DocumentItem,
  PaymentRequest,
  PaymentApprovalStatus,
  TaskStatus,
  NotificationItem,
} from '@/lib/types';
import { Sidebar, NavigationItem } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { GlobalDashboard } from '@/components/dashboard/GlobalDashboard';
import { EventList } from '@/components/events/EventList';
import { EventCreateModal } from '@/components/events/EventCreateModal';
import { EventDetailHeader, EventTabType } from '@/components/events/detail/EventDetailHeader';
import { EventOverviewTab } from '@/components/events/detail/EventOverviewTab';
import { EventTimelineTab } from '@/components/events/detail/EventTimelineTab';
import { EventBudgetTab } from '@/components/events/detail/EventBudgetTab';
import { EventArtistsTab } from '@/components/events/detail/EventArtistsTab';
import { EventProcurementTab } from '@/components/events/detail/EventProcurementTab';
import { EventRevenueTab } from '@/components/events/detail/EventRevenueTab';
import { EventPlanningTab } from '@/components/events/detail/EventPlanningTab';
import { EventRundownTab } from '@/components/events/detail/EventRundownTab';
import { EventCrewTab } from '@/components/events/detail/EventCrewTab';
import { EventLogisticsTab } from '@/components/events/detail/EventLogisticsTab';
import { EventRisksTab } from '@/components/events/detail/EventRisksTab';
import { EventDocumentsTab } from '@/components/events/detail/EventDocumentsTab';
import { EventPaymentsTab } from '@/components/events/detail/EventPaymentsTab';
import { EventReportsTab } from '@/components/events/detail/EventReportsTab';
import { MasterCalendar } from '@/components/planning/MasterCalendar';
import { MilestoneGantt } from '@/components/planning/MilestoneGantt';
import { TaskChecklist } from '@/components/planning/TaskChecklist';
import { MasterFinanceView } from '@/components/finance/MasterFinanceView';
import { MasterSponsorshipView } from '@/components/finance/MasterSponsorshipView';
import { MasterVendorsView } from '@/components/stakeholders/MasterVendorsView';
import { MasterArtistsView } from '@/components/stakeholders/MasterArtistsView';
import { MasterCrewView } from '@/components/stakeholders/MasterCrewView';
import { MasterClientsView } from '@/components/stakeholders/MasterClientsView';
import { MasterVenuesView } from '@/components/stakeholders/MasterVenuesView';
import { MasterRisksView } from '@/components/governance/MasterRisksView';
import { MasterDocumentsView } from '@/components/governance/MasterDocumentsView';
import { MasterReportsView } from '@/components/governance/MasterReportsView';
import { MasterAuditLogsView } from '@/components/governance/MasterAuditLogsView';
import { LogisticsHubView } from '@/components/logistics/LogisticsHubView';

export default function HomePage() {
  // Store Revision State to trigger reactive re-renders on mutations
  const [revision, setRevision] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<NavigationItem>('GLOBAL_DASHBOARD');
  const [activeTab, setActiveTab] = useState<EventTabType>('OVERVIEW');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // User and RBAC
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => db.getCurrentUser());
  const allUsers = db.getUsers();

  // Reactive Derivations directly from singleton db store
  const events = db.getEvents();
  const selectedEvent = selectedEventId ? db.getEventById(selectedEventId) : undefined;
  const budgetItems = selectedEventId ? db.getBudgetItems(selectedEventId) : [];
  const artists = selectedEventId ? db.getArtists(selectedEventId) : [];
  const purchaseOrders = selectedEventId ? db.getPurchaseOrders(selectedEventId) : [];
  const revenues = selectedEventId ? db.getRevenues(selectedEventId) : [];
  const tasks = selectedEventId ? db.getTasks(selectedEventId) : [];
  const rundown = selectedEventId ? db.getRundown(selectedEventId) : [];
  const crew = selectedEventId ? db.getCrew(selectedEventId) : [];
  const requirements = selectedEventId ? db.getRequirements(selectedEventId) : [];
  const risks = selectedEventId ? db.getRisks(selectedEventId) : [];
  const documents = selectedEventId ? db.getDocuments(selectedEventId) : [];
  const notifications = db.getNotifications();

  // Map store payments to PaymentRequest model for the payments tab
  const storePayments = selectedEventId ? db.getPayments(selectedEventId) : [];
  const payments: PaymentRequest[] = storePayments.map((p, idx) => ({
    id: p.id,
    voucherNumber: `VCH-${idx + 101}`,
    eventId: p.eventId,
    beneficiaryName: p.payee,
    category: (p.category || (p.type === 'ARTIST' ? 'Artist Fee' : 'Vendor')) as any,
    amount: p.amount,
    dueDate: p.dueDate || p.paymentDate || '2026-06-01',
    description: p.notes || `Disbursement for ${p.category || p.type}`,
    bankDetails: {
      bankName: p.bankDetails?.bankName || 'BCA',
      accountNumber: p.bankDetails?.accountNumber || '883-019-281',
      accountHolder: p.bankDetails?.accountHolder || p.payee,
    },
    status: (p.status === 'PAID'
      ? 'DISBURSED'
      : p.status === 'APPROVED'
      ? 'APPROVED'
      : 'PENDING_PM') as PaymentApprovalStatus,
    submittedBy: 'Finance Coordinator',
    approvedBy: p.status === 'PAID' || p.status === 'APPROVED' ? 'Bima Satria (PM)' : undefined,
    notes: p.notes,
  }));

  const triggerUpdate = () => {
    setRevision((r) => r + 1);
  };

  // Handlers for Event Selection
  const handleSelectEvent = (id: string | undefined) => {
    setSelectedEventId(id);
    if (id) {
      setCurrentView('EVENTS');
      setActiveTab('OVERVIEW');
    }
  };

  const handleClearSelectedEvent = () => {
    setSelectedEventId(undefined);
    setCurrentView('EVENTS');
  };

  const handleUpdateEventStatus = (newStatus: EventStatus) => {
    if (!selectedEventId) return;
    db.updateEvent(selectedEventId, { status: newStatus });
    triggerUpdate();
  };

  // Notification Interactive Handlers
  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Mark as read in store
    db.markNotificationAsRead(notif.id);

    // 2. Interactive Navigation according to notification action
    if (notif.action) {
      if (notif.action.eventId) {
        setSelectedEventId(notif.action.eventId);
        setCurrentView('EVENTS');
        if (notif.action.tab) {
          setActiveTab(notif.action.tab as EventTabType);
        } else {
          setActiveTab('OVERVIEW');
        }
      } else if (notif.action.view) {
        setSelectedEventId(undefined);
        setCurrentView(notif.action.view as NavigationItem);
      }
    } else if (notif.eventId) {
      setSelectedEventId(notif.eventId);
      setCurrentView('EVENTS');
      setActiveTab('OVERVIEW');
    }

    triggerUpdate();
  };

  const handleMarkAllNotificationsAsRead = () => {
    db.markAllNotificationsAsRead();
    triggerUpdate();
  };

  const handleDeleteNotification = (id: string) => {
    db.deleteNotification(id);
    triggerUpdate();
  };

  const handleViewAllLogs = () => {
    setSelectedEventId(undefined);
    setCurrentView('AUDIT_LOGS');
  };

  // Create Event Handler
  const handleCreateEvent = (data: any) => {
    const created = db.createEvent(data);
    setSelectedEventId(created.id);
    setCurrentView('EVENTS');
    setActiveTab('OVERVIEW');
    setIsCreateModalOpen(false);
    triggerUpdate();
  };

  // Budget Handlers
  const handleAddBudgetItem = (item: Omit<BudgetItem, 'id' | 'variance'>) => {
    db.createBudgetItem(item);
    triggerUpdate();
  };

  const handleUpdateBudgetItem = (id: string, data: Partial<BudgetItem>) => {
    db.updateBudgetItem(id, data);
    triggerUpdate();
  };

  const handleDeleteBudgetItem = (id: string) => {
    db.deleteBudgetItem(id);
    triggerUpdate();
  };

  // Artist Handlers
  const handleAddArtist = (artist: Omit<Artist, 'id'>) => {
    db.createArtist(artist);
    triggerUpdate();
  };

  const handleUpdateArtist = (id: string, data: Partial<Artist>) => {
    db.updateArtist(id, data);
    triggerUpdate();
  };

  // Procurement PO Handlers
  const handleCreatePO = (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    db.createPurchaseOrder(po);
    triggerUpdate();
  };

  const handleUpdatePOStatus = (id: string, status: PurchaseOrder['status']) => {
    db.updatePurchaseOrderStatus(id, status);
    triggerUpdate();
  };

  // Revenue Handlers
  const handleCreateRevenue = (rev: Omit<RevenueItem, 'id' | 'outstanding'>) => {
    db.createRevenue(rev);
    triggerUpdate();
  };

  // Task Handlers
  const handleCreateTask = (task: Omit<Task, 'id'>) => {
    db.createTask(task);
    triggerUpdate();
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    db.updateTaskStatus(id, status);
    triggerUpdate();
  };

  const handleDeleteTask = (id: string) => {
    db.deleteTask(id);
    triggerUpdate();
  };

  const handleGenerateChecklist = (eventId: string) => {
    db.generateStandardChecklist(eventId);
    triggerUpdate();
  };

  // Rundown Handlers
  const handleCreateRundown = (item: Omit<RundownItem, 'id' | 'order'>) => {
    db.createRundownItem(item);
    triggerUpdate();
  };

  const handleUpdateRundown = (id: string, data: Partial<RundownItem>) => {
    db.updateRundownItem(id, data);
    triggerUpdate();
  };

  const handleDeleteRundown = (id: string) => {
    db.deleteRundownItem(id);
    triggerUpdate();
  };

  const handleReorderRundown = (newOrderedIds: string[]) => {
    if (!selectedEventId) return;
    db.reorderRundown(selectedEventId, newOrderedIds);
    triggerUpdate();
  };

  // Event Update & Timeline Navigation Handlers
  const handleUpdateEvent = (id: string, data: Partial<Event>) => {
    db.updateEvent(id, data);
    triggerUpdate();
  };

  const handleNavigateToTimeline = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('EVENTS');
    setActiveTab('TIMELINE');
  };

  // Crew Handlers
  const handleCreateCrew = (member: Omit<CrewAssignment, 'id'>) => {
    db.createCrew(member);
    triggerUpdate();
  };

  // Logistics ERP Handlers
  const handleCreateRequirement = (req: Omit<EventRequirement, 'id' | 'externalSystem'>) => {
    db.createRequirement(req);
    triggerUpdate();
  };

  const handleDispatchLogistics = () => {
    if (!selectedEventId) return;
    db.dispatchLogisticsRequest(selectedEventId);
    triggerUpdate();
  };

  // Risk Handlers
  const handleCreateRisk = (risk: Omit<RiskItem, 'id' | 'severity'>) => {
    db.createRisk(risk);
    triggerUpdate();
  };

  const handleUpdateRiskStatus = (id: string, status: RiskItem['status']) => {
    const risk = risks.find((r) => r.id === id);
    if (risk) {
      risk.status = status;
      triggerUpdate();
    }
  };

  // Document Handlers
  const handleCreateDocument = (doc: Omit<DocumentItem, 'id'>) => {
    db.addDocument(doc);
    triggerUpdate();
  };

  // Payment Handlers
  const handleCreatePayment = (payment: Omit<PaymentRequest, 'id' | 'voucherNumber'>) => {
    const event = selectedEventId ? db.getEventById(selectedEventId) : undefined;
    db.recordPayment({
      eventId: payment.eventId,
      eventName: event?.name || 'Event',
      payee: payment.beneficiaryName,
      type: payment.category === 'Vendor' ? 'VENDOR' : payment.category === 'Artist Fee' ? 'ARTIST' : 'OTHER',
      reference: `REF-${Date.now()}`,
      category: payment.category,
      amount: payment.amount,
      dueDate: payment.dueDate,
      paymentDate: payment.dueDate,
      paymentMethod: 'Bank Transfer',
      status: 'SCHEDULED',
      notes: payment.description,
      bankDetails: payment.bankDetails,
    });
    triggerUpdate();
  };

  const handleUpdatePaymentStatus = (id: string, status: PaymentApprovalStatus, approverName?: string) => {
    const payStatus = status === 'DISBURSED' ? 'PAID' : status === 'APPROVED' ? 'APPROVED' : 'PENDING';
    const record = db.getPayments(selectedEventId).find((p) => p.id === id);
    if (record) {
      record.status = payStatus;
      triggerUpdate();
    }
  };

  const handleDeleteEvent = (id: string) => {
    db.purgeEvent(id);
    if (selectedEventId === id) {
      setSelectedEventId(undefined);
    }
    triggerUpdate();
  };

  const handleClearAllEvents = () => {
    db.clearAllEvents();
    setSelectedEventId(undefined);
    triggerUpdate();
  };

  const handleResetToOneSampleEvent = () => {
    db.resetToOneSampleEvent();
    triggerUpdate();
  };

  // Global KPIs for badges & indicators
  const globalKPIs = db.calculateGlobalKPIs();
  const eventHealth = selectedEvent
    ? db.calculateEventHealth(selectedEvent)
    : { score: 100, status: 'HEALTHY' as const, reasons: [] };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased selection:bg-indigo-500/30">
      {/* 1. Global Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (
            view === 'GLOBAL_DASHBOARD' ||
            view === 'EVENTS' ||
            view === 'CALENDAR' ||
            view === 'TIMELINE' ||
            view === 'TASKS'
          ) {
            setSelectedEventId(undefined);
          }
        }}
        selectedEventId={selectedEventId}
        onClearSelectedEvent={handleClearSelectedEvent}
        activeEventsCount={globalKPIs.activeEventsCount}
        pendingApprovalsCount={globalKPIs.pendingApprovalsCount}
        criticalRisksCount={globalKPIs.criticalRisksCount}
        logisticsQueueCount={requirements.filter((r) => r.status === 'REQUESTED').length}
        userRole={currentUser.role}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Application Header */}
        <Header
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={handleSelectEvent}
          onOpenNewEventModal={() => setIsCreateModalOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={(u) => {
            db.setCurrentUser(u);
            setCurrentUser(u);
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onDeleteNotification={handleDeleteNotification}
          onViewAllLogs={handleViewAllLogs}
        />

        {/* Scrollable Work Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          {/* VIEW ROUTING */}
          {currentView === 'GLOBAL_DASHBOARD' && !selectedEventId && (
            <GlobalDashboard
              events={events}
              payments={db.getPayments()}
              risks={db.getRisks()}
              tasks={db.getTasks()}
              onSelectEvent={handleSelectEvent}
              onOpenNewEventModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentView === 'EVENTS' && !selectedEventId && (
            <EventList
              events={events}
              onSelectEvent={handleSelectEvent}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onDeleteEvent={handleDeleteEvent}
              onClearAllEvents={handleClearAllEvents}
              onResetToOneSampleEvent={handleResetToOneSampleEvent}
            />
          )}

          {currentView === 'CALENDAR' && !selectedEventId && (
            <MasterCalendar
              events={events}
              tasks={db.getTasks()}
              onSelectEvent={handleSelectEvent}
              onOpenCreateEvent={() => setIsCreateModalOpen(true)}
              onNavigateToTimeline={handleNavigateToTimeline}
            />
          )}

          {currentView === 'TIMELINE' && !selectedEventId && (
            <MilestoneGantt
              events={events}
              tasks={db.getTasks()}
              onSelectEvent={handleSelectEvent}
              onOpenCreateEvent={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentView === 'TASKS' && !selectedEventId && (
            <TaskChecklist
              events={events}
              tasks={db.getTasks()}
              onSelectEvent={handleSelectEvent}
              onCreateTask={handleCreateTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onGenerateChecklist={handleGenerateChecklist}
            />
          )}

          {/* FINANCE & PROCUREMENT VIEWS */}
          {currentView === 'FINANCE' && !selectedEventId && (
            <MasterFinanceView
              events={events}
              budgetItems={db.getBudgetItems()}
              revenues={db.getRevenues()}
              purchaseOrders={db.getPurchaseOrders()}
              payments={db.getPayments()}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentView === 'VENDORS' && !selectedEventId && (
            <MasterVendorsView
              vendors={db.getVendors()}
              purchaseOrders={db.getPurchaseOrders()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateVendor={(v) => {
                db.createVendor(v);
                setRevision((r) => r + 1);
              }}
              onUpdateVendor={(id, v) => {
                db.updateVendor(id, v);
                setRevision((r) => r + 1);
              }}
              onDeleteVendor={(id) => {
                db.deleteVendor(id);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {currentView === 'SPONSORSHIP' && !selectedEventId && (
            <MasterSponsorshipView
              sponsorships={db.getSponsorships()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateSponsorship={(s) => {
                db.createSponsorship(s);
                setRevision((r) => r + 1);
              }}
              onUpdateSponsorship={(id, s) => {
                db.updateSponsorship(id, s);
                setRevision((r) => r + 1);
              }}
              onDeleteSponsorship={(id) => {
                db.deleteSponsorship(id);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {/* STAKEHOLDERS & TALENT VIEWS */}
          {currentView === 'ARTISTS' && !selectedEventId && (
            <MasterArtistsView
              artists={db.getArtists()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onAddArtist={(a) => {
                db.createArtist(a);
                setRevision((r) => r + 1);
              }}
              onUpdateArtist={(id, a) => {
                db.updateArtist(id, a);
                setRevision((r) => r + 1);
              }}
              onDeleteArtist={(id) => {
                db.deleteArtist(id);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {currentView === 'CREW' && !selectedEventId && (
            <MasterCrewView
              crew={db.getCrew()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateCrew={(c) => {
                db.createCrew(c);
                setRevision((r) => r + 1);
              }}
              onUpdateCrew={(id, c) => {
                db.updateCrew(id, c);
                setRevision((r) => r + 1);
              }}
              onDeleteCrew={(id) => {
                db.deleteCrew(id);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {currentView === 'CLIENTS' && !selectedEventId && (
            <MasterClientsView
              clients={db.getClients()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateClient={(c) => {
                db.createClient(c);
                setRevision((r) => r + 1);
              }}
              onUpdateClient={(id, c) => {
                db.updateClient(id, c);
                setRevision((r) => r + 1);
              }}
              onDeleteClient={(id) => {
                db.deleteClient(id);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {currentView === 'VENUES' && !selectedEventId && (
            <MasterVenuesView
              venues={db.getVenues()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateVenue={(v) => {
                db.createVenue(v);
                setRevision((r) => r + 1);
              }}
              onUpdateVenue={(id, v) => {
                db.updateVenue(id, v);
                setRevision((r) => r + 1);
              }}
              onDeleteVenue={(id) => {
                db.deleteVenue(id);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {/* GOVERNANCE & AUDIT VIEWS */}
          {currentView === 'RISKS' && !selectedEventId && (
            <MasterRisksView
              risks={db.getRisks()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateRisk={(r) => {
                db.createRisk(r);
                setRevision((r) => r + 1);
              }}
              onUpdateRiskStatus={(id, status) => {
                const rk = db.getRisks().find((r) => r.id === id);
                if (rk) {
                  rk.status = status;
                  setRevision((r) => r + 1);
                }
              }}
            />
          )}

          {currentView === 'DOCUMENTS' && !selectedEventId && (
            <MasterDocumentsView
              documents={db.getDocuments()}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateDocument={(d) => {
                db.addDocument(d);
                setRevision((r) => r + 1);
              }}
            />
          )}

          {currentView === 'REPORTS' && !selectedEventId && (
            <MasterReportsView
              events={events}
              budgetItems={db.getBudgetItems()}
              revenues={db.getRevenues()}
              risks={db.getRisks()}
              tasks={db.getTasks()}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentView === 'AUDIT_LOGS' && !selectedEventId && (
            <MasterAuditLogsView
              auditLogs={db.getAuditLogs()}
              users={allUsers}
              currentUser={currentUser}
            />
          )}

          {/* INTEGRATION LAYER: ERP LOGISTICS HUB */}
          {currentView === 'LOGISTICS_HUB' && !selectedEventId && (
            <LogisticsHubView />
          )}

          {/* EVENT DETAIL VIEW WITH TAB WORKSPACES */}
          {selectedEvent && (
            <div className="space-y-6">
              <EventDetailHeader
                event={selectedEvent}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onBackToGlobal={handleClearSelectedEvent}
                onUpdateStatus={handleUpdateEventStatus}
                health={eventHealth}
                onDeleteEvent={handleDeleteEvent}
              />

              {/* Tab 1: Overview */}
              {activeTab === 'OVERVIEW' && (
                <EventOverviewTab
                  event={selectedEvent}
                  health={eventHealth}
                  financials={db.calculateFinancialSummary(selectedEvent)}
                  sponsorships={db.getSponsorships(selectedEvent.id)}
                  onNavigateTab={setActiveTab}
                />
              )}

              {/* Tab: Timeline & Milestones */}
              {activeTab === 'TIMELINE' && (
                <EventTimelineTab
                  event={selectedEvent}
                  onUpdateEvent={handleUpdateEvent}
                  onNavigateTab={setActiveTab}
                  onNavigateView={(view) => {
                    setSelectedEventId(undefined);
                    setCurrentView(view as NavigationItem);
                  }}
                />
              )}

              {/* Tab 2: Budget & Variance */}
              {activeTab === 'BUDGET' && (
                <EventBudgetTab
                  event={selectedEvent}
                  budgetItems={budgetItems}
                  onAddBudgetItem={handleAddBudgetItem}
                  onUpdateBudgetItem={handleUpdateBudgetItem}
                  onDeleteBudgetItem={handleDeleteBudgetItem}
                />
              )}

              {/* Tab 3: Talent & Riders */}
              {activeTab === 'TALENT' && (
                <EventArtistsTab
                  event={selectedEvent}
                  artists={artists}
                  onAddArtist={handleAddArtist}
                  onUpdateArtist={handleUpdateArtist}
                />
              )}

              {/* Tab 4: Procurement & POs */}
              {activeTab === 'PROCUREMENT' && (
                <EventProcurementTab
                  event={selectedEvent}
                  purchaseOrders={purchaseOrders}
                  vendors={db.getVendors()}
                  onCreatePO={handleCreatePO}
                  onUpdatePOStatus={handleUpdatePOStatus}
                />
              )}

              {/* Tab 5: Revenue Streams */}
              {activeTab === 'REVENUE' && (
                <EventRevenueTab
                  event={selectedEvent}
                  revenues={revenues}
                  onCreateRevenue={handleCreateRevenue}
                />
              )}

              {/* Tab: Sponsorship & Strategic Partners */}
              {activeTab === 'SPONSORSHIP' && (
                <MasterSponsorshipView
                  sponsorships={db.getSponsorships(selectedEvent.id)}
                  events={[selectedEvent]}
                  selectedEventFilterId={selectedEvent.id}
                  onSelectEvent={handleSelectEvent}
                  onCreateSponsorship={(s) => {
                    db.createSponsorship({ ...s, eventId: selectedEvent.id });
                    setRevision((r) => r + 1);
                  }}
                  onUpdateSponsorship={(id, s) => {
                    db.updateSponsorship(id, s);
                    setRevision((r) => r + 1);
                  }}
                  onDeleteSponsorship={(id) => {
                    db.deleteSponsorship(id);
                    setRevision((r) => r + 1);
                  }}
                />
              )}

              {/* Tab 6: Tasks & Checklist */}
              {activeTab === 'PLANNING' && (
                <EventPlanningTab
                  event={selectedEvent}
                  tasks={tasks}
                  onCreateTask={handleCreateTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onGenerateChecklist={handleGenerateChecklist}
                />
              )}

              {/* Tab 7: Master Rundown */}
              {activeTab === 'RUNDOWN' && (
                <EventRundownTab
                  event={selectedEvent}
                  rundown={rundown}
                  onCreateRundownItem={handleCreateRundown}
                  onUpdateRundownItem={handleUpdateRundown}
                  onDeleteRundownItem={handleDeleteRundown}
                  onReorderRundown={handleReorderRundown}
                />
              )}

              {/* Tab 8: Crew Roster */}
              {activeTab === 'CREW' && (
                <EventCrewTab
                  event={selectedEvent}
                  crew={crew}
                  onCreateCrew={handleCreateCrew}
                />
              )}

              {/* Tab 9: ERP Logistics Hub */}
              {activeTab === 'LOGISTICS_ERP' && (
                <EventLogisticsTab
                  event={selectedEvent}
                  requirements={requirements}
                  onCreateRequirement={handleCreateRequirement}
                  onDispatchLogistics={handleDispatchLogistics}
                />
              )}

              {/* Tab 10: Risk Register */}
              {activeTab === 'RISKS' && (
                <EventRisksTab
                  event={selectedEvent}
                  risks={risks}
                  onCreateRisk={handleCreateRisk}
                  onUpdateRiskStatus={handleUpdateRiskStatus}
                />
              )}

              {/* Tab 11: Documents Vault */}
              {activeTab === 'DOCUMENTS' && (
                <EventDocumentsTab
                  event={selectedEvent}
                  documents={documents}
                  onCreateDocument={handleCreateDocument}
                />
              )}

              {/* Tab 12: Disbursements & Approvals */}
              {activeTab === 'PAYMENTS' && (
                <EventPaymentsTab
                  event={selectedEvent}
                  payments={payments}
                  onCreatePayment={handleCreatePayment}
                  onUpdatePaymentStatus={handleUpdatePaymentStatus}
                />
              )}

              {/* Tab 13: Reports & P&L */}
              {activeTab === 'REPORTS' && (
                <EventReportsTab
                  event={selectedEvent}
                  budgetItems={budgetItems}
                  revenueItems={revenues}
                  risks={risks}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <EventCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        clients={db.getClients()}
        venues={db.getVenues()}
        templates={db.getTemplates()}
        users={db.getUsers()}
        onCreateEvent={handleCreateEvent}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        events={events}
        artists={db.getArtists()}
        vendors={db.getVendors()}
        tasks={db.getTasks()}
        documents={db.getDocuments()}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  );
}
