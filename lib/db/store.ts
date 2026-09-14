import {
  Event,
  BudgetItem,
  Artist,
  Vendor,
  VendorQuotation,
  PurchaseOrder,
  RevenueItem,
  Client,
  Venue,
  CrewAssignment,
  Task,
  RundownItem,
  RiskItem,
  ApprovalRequest,
  PaymentRecord,
  DocumentItem,
  AuditLogItem,
  UserAccount,
  EventTemplate,
  EventRequirement,
  NotificationItem,
  HealthStatus,
  UUID,
  SponsorshipItem,
} from '@/lib/types';
import {
  SEED_USERS,
  SEED_CLIENTS,
  SEED_VENUES,
  SEED_VENDORS,
  SEED_TEMPLATES,
  SEED_EVENTS,
  SEED_BUDGET_ITEMS,
  SEED_ARTISTS,
  SEED_PURCHASE_ORDERS,
  SEED_REVENUES,
  SEED_CREW,
  SEED_TASKS,
  SEED_RUNDOWN,
  SEED_RISKS,
  SEED_APPROVALS,
  SEED_PAYMENTS,
  SEED_DOCUMENTS,
  SEED_AUDIT_LOGS,
  SEED_REQUIREMENTS,
  SEED_NOTIFICATIONS,
  SEED_SPONSORSHIPS,
} from './seed';

let idCounter = 0;
export function generateUniqueId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 7)}`;
}

// Singleton in-memory relational state
class EventSystemStore {
  private users: UserAccount[] = [...SEED_USERS];
  private clients: Client[] = [...SEED_CLIENTS];
  private venues: Venue[] = [...SEED_VENUES];
  private vendors: Vendor[] = [...SEED_VENDORS];
  private templates: EventTemplate[] = [...SEED_TEMPLATES];
  private events: Event[] = [...SEED_EVENTS];
  private budgetItems: BudgetItem[] = SEED_BUDGET_ITEMS.filter((b) => !b.eventId || SEED_EVENTS.some((e) => e.id === b.eventId));
  private artists: Artist[] = SEED_ARTISTS.filter((a) => !a.eventId || SEED_EVENTS.some((e) => e.id === a.eventId));
  private quotations: VendorQuotation[] = [];
  private purchaseOrders: PurchaseOrder[] = SEED_PURCHASE_ORDERS.filter((p) => !p.eventId || SEED_EVENTS.some((e) => e.id === p.eventId));
  private revenues: RevenueItem[] = SEED_REVENUES.filter((r) => !r.eventId || SEED_EVENTS.some((e) => e.id === r.eventId));
  private crew: CrewAssignment[] = SEED_CREW.filter((c) => !c.eventId || SEED_EVENTS.some((e) => e.id === c.eventId));
  private tasks: Task[] = SEED_TASKS.filter((t) => !t.eventId || SEED_EVENTS.some((e) => e.id === t.eventId));
  private rundown: RundownItem[] = SEED_RUNDOWN.filter((r) => !r.eventId || SEED_EVENTS.some((e) => e.id === r.eventId));
  private risks: RiskItem[] = SEED_RISKS.filter((r) => !r.eventId || SEED_EVENTS.some((e) => e.id === r.eventId));
  private approvals: ApprovalRequest[] = SEED_APPROVALS.filter((a) => !a.eventId || SEED_EVENTS.some((e) => e.id === a.eventId));
  private payments: PaymentRecord[] = SEED_PAYMENTS.filter((p) => !p.eventId || SEED_EVENTS.some((e) => e.id === p.eventId));
  private documents: DocumentItem[] = SEED_DOCUMENTS.filter((d) => !d.eventId || SEED_EVENTS.some((e) => e.id === d.eventId));
  private auditLogs: AuditLogItem[] = SEED_AUDIT_LOGS.filter((a) => !a.eventId || SEED_EVENTS.some((e) => e.id === a.eventId));
  private requirements: EventRequirement[] = SEED_REQUIREMENTS.filter((r) => !r.eventId || SEED_EVENTS.some((e) => e.id === r.eventId));
  private notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];
  private sponsorships: SponsorshipItem[] = [...SEED_SPONSORSHIPS];
  private currentUser: UserAccount = SEED_USERS[0]; // Bima Satria Wardhana (Super Admin)

  // Current User / RBAC
  getCurrentUser(): UserAccount {
    return this.currentUser;
  }

  setCurrentUser(user: UserAccount) {
    this.currentUser = user;
  }

  getUsers(): UserAccount[] {
    return [...this.users];
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  markNotificationAsRead(id: UUID): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  deleteNotification(id: UUID): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  clearAllNotifications(): void {
    this.notifications = [];
  }

  createNotification(item: Omit<NotificationItem, 'id' | 'createdAt'> & { createdAt?: string }): NotificationItem {
    const newNotif: NotificationItem = {
      ...item,
      id: generateUniqueId('notif'),
      createdAt: item.createdAt || 'Baru saja',
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  // Clients
  getClients(): Client[] {
    return [...this.clients];
  }

  getClientById(id: UUID): Client | undefined {
    return this.clients.find((c) => c.id === id);
  }

  createClient(
    client: Omit<Client, 'id' | 'totalEvents' | 'activeEvents' | 'completedEvents'> & {
      totalEvents?: number;
      activeEvents?: number;
      completedEvents?: number;
      totalRevenue?: number;
      outstandingReceivable?: number;
    }
  ): Client {
    const newClient: Client = {
      id: generateUniqueId('cli'),
      company: client.company,
      contactPerson: client.contactPerson,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      industry: client.industry || 'Corporate',
      taxInformation: client.taxInformation || '',
      notes: client.notes || '',
      totalEvents: client.totalEvents || 0,
      activeEvents: client.activeEvents || 0,
      completedEvents: client.completedEvents || 0,
      totalRevenue: client.totalRevenue || 0,
      outstandingReceivable: client.outstandingReceivable || 0,
    };
    this.clients.unshift(newClient);
    this.logAudit('CREATE', 'Client', newClient.id, undefined, `Created client ${newClient.company}`);
    return newClient;
  }

  updateClient(id: UUID, data: Partial<Client>): Client | undefined {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const prev = this.clients[idx];
    const updated: Client = {
      ...prev,
      ...data,
    };
    this.clients[idx] = updated;
    this.logAudit(
      'UPDATE',
      'Client',
      id,
      JSON.stringify({ company: prev.company, contactPerson: prev.contactPerson }),
      JSON.stringify({ company: updated.company, contactPerson: updated.contactPerson })
    );
    return updated;
  }

  deleteClient(id: UUID): boolean {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const removed = this.clients.splice(idx, 1)[0];
    this.logAudit('DELETE', 'Client', id, undefined, `Deleted client ${removed.company}`);
    return true;
  }

  // Venues
  getVenues(): Venue[] {
    return [...this.venues];
  }

  getVenueById(id: UUID): Venue | undefined {
    return this.venues.find((v) => v.id === id);
  }

  createVenue(venue: Omit<Venue, 'id'>): Venue {
    const newVenue: Venue = {
      ...venue,
      id: generateUniqueId('ven'),
    };
    this.venues.unshift(newVenue);
    this.logAudit('CREATE', 'Venue', newVenue.id, undefined, `Created venue ${newVenue.name}`);
    return newVenue;
  }

  updateVenue(id: UUID, data: Partial<Venue>): Venue | undefined {
    const idx = this.venues.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    const prev = this.venues[idx];
    const updated: Venue = {
      ...prev,
      ...data,
    };
    this.venues[idx] = updated;
    this.logAudit('UPDATE', 'Venue', id, undefined, `Updated venue ${updated.name}`);
    return updated;
  }

  deleteVenue(id: UUID): boolean {
    const idx = this.venues.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    const deleted = this.venues.splice(idx, 1)[0];
    this.logAudit('DELETE', 'Venue', id, undefined, `Deleted venue ${deleted.name}`);
    return true;
  }

  // Templates
  getTemplates(): EventTemplate[] {
    return [...this.templates];
  }

  // Events
  getEvents(): Event[] {
    return this.events.map((evt) => this.hydrateEventRollup(evt));
  }

  getEventById(id: UUID): Event | undefined {
    const evt = this.events.find((e) => e.id === id);
    return evt ? this.hydrateEventRollup(evt) : undefined;
  }

  createEvent(data: Partial<Event> & { templateId?: UUID }): Event {
    const id = generateUniqueId('evt');
    const code = `EVT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const venue = this.venues.find((v) => v.id === data.venueId) || this.venues[0];
    const client = this.clients.find((c) => c.id === data.clientId) || this.clients[0];

    const eventDay = data.eventDayDate || data.startDate || new Date(Date.now() + 30 * 86400000).toISOString();
    const eventDayMs = new Date(eventDay).getTime();
    const eventLoadIn = data.loadInDate || new Date(eventDayMs - 4 * 86400000).toISOString();
    const eventSetup = data.setupDate || new Date(eventDayMs - 3 * 86400000).toISOString();
    const eventTechRehearsal = data.technicalRehearsalDate || new Date(eventDayMs - 2 * 86400000).toISOString();
    const eventGR = data.generalRehearsalDate || new Date(eventDayMs - 1 * 86400000).toISOString();
    const eventStrike = data.strikeDate || new Date(eventDayMs + 1 * 86400000).toISOString();
    const eventLoadOut = data.loadOutDate || new Date(eventDayMs + 2 * 86400000).toISOString();
    const eventStart = data.startDate || eventLoadIn;
    const eventEnd = data.endDate || eventLoadOut;

    const newEvent: Event = {
      id,
      code,
      name: data.name || 'Untitled Event',
      type: data.type || 'Concert',
      clientId: client.id,
      clientName: client.company,
      clientContact: `${client.contactPerson} (${client.phone})`,
      description: data.description || '',
      objective: data.objective || '',
      theme: data.theme || '',
      venueId: venue.id,
      venueName: venue.name,
      venueAddress: venue.address,
      city: venue.city,
      province: data.province || 'DKI Jakarta',
      country: 'Indonesia',
      startDate: eventStart,
      endDate: eventEnd,
      loadInDate: eventLoadIn,
      setupDate: eventSetup,
      technicalRehearsalDate: eventTechRehearsal,
      generalRehearsalDate: eventGR,
      eventDayDate: eventDay,
      strikeDate: eventStrike,
      loadOutDate: eventLoadOut,
      expectedAttendance: data.expectedAttendance || 5000,
      actualAttendance: 0,
      status: data.status || 'DRAFT',
      priority: data.priority || 'MEDIUM',
      pics: data.pics || {
        projectManager: this.currentUser.name,
        eventPIC: this.currentUser.name,
        financePIC: 'Ratna Ayu Larasati',
        productionPIC: 'Hendra Setiawan',
        technicalPIC: 'Ir. Johanes Handoko',
        creativePIC: 'Nadia Putri',
        salesPIC: this.currentUser.name,
        safetyOfficer: 'Kapt. Bambang Sudiro',
        logisticsPIC: 'Eko Prasetyo',
      },
      totalBudget: data.totalBudget || 500000000,
      estimatedCost: 0,
      actualCost: 0,
      committedCost: 0,
      totalRevenue: data.totalRevenue || 750000000,
      actualRevenue: 0,
      receivedRevenue: 0,
      currency: 'IDR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || [data.type || 'Event'],
      customMilestones: data.customMilestones || [],
    };

    this.events.unshift(newEvent);

    // Apply template defaults or generate standard checklist
    if (data.templateId) {
      this.applyTemplateToEvent(id, data.templateId);
    } else {
      this.generateStandardChecklist(id);
    }

    this.logAudit('CREATE', 'Event', newEvent.id, undefined, `Created event ${newEvent.name} (${newEvent.code})`);
    return this.hydrateEventRollup(newEvent);
  }

  updateEvent(id: UUID, data: Partial<Event>): Event | undefined {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    const prev = this.events[idx];
    const updated: Event = {
      ...prev,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.events[idx] = updated;
    this.logAudit(
      'UPDATE',
      'Event',
      id,
      JSON.stringify({ status: prev.status, name: prev.name }),
      JSON.stringify({ status: updated.status, name: updated.name })
    );
    return this.hydrateEventRollup(updated);
  }

  deleteEvent(id: UUID): boolean {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    // Archive rather than delete to maintain auditability
    this.events[idx].status = 'ARCHIVED';
    this.logAudit('STATUS_CHANGE', 'Event', id, undefined, 'Status set to ARCHIVED');
    return true;
  }

  purgeEvent(id: UUID): boolean {
    this.events = this.events.filter((e) => e.id !== id);
    this.budgetItems = this.budgetItems.filter((b) => b.eventId !== id);
    this.artists = this.artists.filter((a) => a.eventId !== id);
    this.purchaseOrders = this.purchaseOrders.filter((p) => p.eventId !== id);
    this.revenues = this.revenues.filter((r) => r.eventId !== id);
    this.crew = this.crew.filter((c) => c.eventId !== id);
    this.tasks = this.tasks.filter((t) => t.eventId !== id);
    this.rundown = this.rundown.filter((r) => r.eventId !== id);
    this.risks = this.risks.filter((r) => r.eventId !== id);
    this.approvals = this.approvals.filter((a) => a.eventId !== id);
    this.payments = this.payments.filter((p) => p.eventId !== id);
    this.documents = this.documents.filter((d) => d.eventId !== id);
    this.requirements = this.requirements.filter((r) => r.eventId !== id);
    this.logAudit('DELETE', 'Event', id, undefined, `Completely purged event ${id}`);
    return true;
  }

  clearAllEvents(): void {
    this.events = [];
    this.budgetItems = [];
    this.artists = [];
    this.purchaseOrders = [];
    this.revenues = [];
    this.crew = [];
    this.tasks = [];
    this.rundown = [];
    this.risks = [];
    this.approvals = [];
    this.payments = [];
    this.documents = [];
    this.requirements = [];
    this.logAudit('DELETE', 'Event', 'ALL', undefined, 'Cleared all events for fresh start');
  }

  resetToOneSampleEvent(): void {
    this.events = [...SEED_EVENTS.slice(0, 1)];
    const sampleId = this.events[0]?.id;
    if (sampleId) {
      this.budgetItems = SEED_BUDGET_ITEMS.filter((b) => b.eventId === sampleId);
      this.artists = SEED_ARTISTS.filter((a) => a.eventId === sampleId);
      this.purchaseOrders = SEED_PURCHASE_ORDERS.filter((p) => p.eventId === sampleId);
      this.revenues = SEED_REVENUES.filter((r) => r.eventId === sampleId);
      this.crew = SEED_CREW.filter((c) => c.eventId === sampleId);
      this.tasks = SEED_TASKS.filter((t) => t.eventId === sampleId);
      this.rundown = SEED_RUNDOWN.filter((r) => r.eventId === sampleId);
      this.risks = SEED_RISKS.filter((r) => r.eventId === sampleId);
      this.approvals = SEED_APPROVALS.filter((a) => a.eventId === sampleId);
      this.payments = SEED_PAYMENTS.filter((p) => p.eventId === sampleId);
      this.documents = SEED_DOCUMENTS.filter((d) => d.eventId === sampleId);
      this.requirements = SEED_REQUIREMENTS.filter((r) => r.eventId === sampleId);
      this.notifications = [...SEED_NOTIFICATIONS];
    }
  }

  private applyTemplateToEvent(eventId: UUID, templateId: UUID) {
    const tpl = this.templates.find((t) => t.id === templateId);
    if (!tpl) return;

    // Seed default tasks
    tpl.defaultChecklist.forEach((chk, i) => {
      this.tasks.push({
        id: `tsk-tpl-${Date.now()}-${i}`,
        eventId,
        name: chk,
        description: `Checklist task from template: ${tpl.name}`,
        category: 'Planning',
        assignee: 'Project Manager',
        priority: 'MEDIUM',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + (i + 1) * 3 * 86400000).toISOString().split('T')[0],
        status: 'To Do',
        notes: 'Dibuat otomatis dari template',
      });
    });

    // Seed default rundown items
    const times = ['15:00', '16:30', '18:00', '19:30', '21:00', '22:30'];
    ['Open Gate', 'Opening Act', 'Break & Sholat', 'Supporting Artist', 'Main Headliner', 'Closing Ceremony'].forEach(
      (seg, i) => {
        this.rundown.push({
          id: `rnd-tpl-${Date.now()}-${i}`,
          eventId,
          time: times[i] || '20:00',
          duration: 60,
          segment: seg,
          description: `Rundown item dari template ${tpl.name}`,
          talent: seg.includes('Artist') ? 'Talent TBD' : 'MC',
          venueArea: 'Main Stage',
          pic: 'Stage Manager',
          technicalCue: 'Cue standby',
          audioCue: 'Standard preset',
          lightingCue: 'Standard scene',
          videoCue: 'Template loop',
          specialEffect: 'None',
          notes: '',
          order: i + 1,
        });
      }
    );

    // Seed default milestones to event.customMilestones if not already present
    const evt = this.events.find((e) => e.id === eventId);
    if (evt && (!evt.customMilestones || evt.customMilestones.length === 0)) {
      const eventDayMs = new Date(evt.eventDayDate || evt.startDate).getTime();
      evt.customMilestones = (tpl.defaultMilestones || []).map((msName, idx) => {
        const offsetDays = -14 + idx * 2;
        const msDate = new Date(eventDayMs + offsetDays * 86400000).toISOString().split('T')[0];
        let cat: any = 'CUSTOM';
        const lower = msName.toLowerCase();
        if (lower.includes('load in') || lower.includes('rigging')) cat = 'LOAD_IN';
        else if (lower.includes('setup') || lower.includes('vendor')) cat = 'SETUP';
        else if (lower.includes('rehearsal') || lower.includes('sound check') || lower.includes('dry run')) cat = 'REHEARSAL';
        else if (lower.includes('day') || lower.includes('festival') || lower.includes('conference')) cat = 'SHOW_DAY';
        else if (lower.includes('strike') || lower.includes('load out')) cat = 'STRIKE';

        return {
          id: `ms-tpl-${Date.now()}-${idx}`,
          name: msName,
          category: cat,
          date: msDate,
          time: '10:00',
          status: 'SCHEDULED',
          pic: evt.pics?.projectManager || 'Project Manager',
          notes: `Auto-generated dari template ${tpl.name}`,
        };
      });
    }
  }

  private hydrateEventRollup(evt: Event): Event {
    const eventBudgets = this.budgetItems.filter((b) => b.eventId === evt.id);
    const eventRevenues = this.revenues.filter((r) => r.eventId === evt.id);
    const eventPOs = this.purchaseOrders.filter((p) => p.eventId === evt.id);

    const estimatedCost = eventBudgets.reduce((acc, curr) => acc + (curr.estimatedTotal || 0), 0);
    const actualCost = eventBudgets.reduce((acc, curr) => acc + (curr.actualTotal || 0), 0);
    const committedCost = eventPOs
      .filter((p) => p.status !== 'Cancelled')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    const actualRevenue = eventRevenues.reduce((acc, curr) => acc + (curr.actualRevenue || 0), 0);
    const receivedRevenue = eventRevenues.reduce((acc, curr) => acc + (curr.received || 0), 0);

    return {
      ...evt,
      estimatedCost: estimatedCost || evt.estimatedCost,
      actualCost: actualCost || evt.actualCost,
      committedCost: committedCost || evt.committedCost,
      actualRevenue: actualRevenue || evt.actualRevenue,
      receivedRevenue: receivedRevenue || evt.receivedRevenue,
    };
  }

  // Budget Items
  getBudgetItems(eventId?: UUID): BudgetItem[] {
    if (!eventId) return [...this.budgetItems];
    return this.budgetItems.filter((b) => b.eventId === eventId);
  }

  createBudgetItem(item: Omit<BudgetItem, 'id' | 'variance'>): BudgetItem {
    const estTotal = (item.quantity || 1) * (item.estimatedUnitCost || 0);
    const actTotal = (item.quantity || 1) * (item.actualUnitCost || 0);
    const variance = estTotal - actTotal;

    const newItem: BudgetItem = {
      ...item,
      id: generateUniqueId('bdg'),
      estimatedTotal: estTotal,
      actualTotal: actTotal,
      variance,
    };

    this.budgetItems.unshift(newItem);
    this.logAudit('CREATE', 'BudgetItem', newItem.id, undefined, `Created budget item: ${newItem.description} (Rp ${estTotal.toLocaleString('id-ID')})`, item.eventId);
    return newItem;
  }

  updateBudgetItem(id: UUID, data: Partial<BudgetItem>): BudgetItem | undefined {
    const idx = this.budgetItems.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    const prev = this.budgetItems[idx];
    const qty = data.quantity ?? prev.quantity;
    const estUnit = data.estimatedUnitCost ?? prev.estimatedUnitCost;
    const actUnit = data.actualUnitCost ?? prev.actualUnitCost;
    const estTotal = qty * estUnit;
    const actTotal = qty * actUnit;
    const variance = estTotal - actTotal;

    const updated: BudgetItem = {
      ...prev,
      ...data,
      quantity: qty,
      estimatedUnitCost: estUnit,
      actualUnitCost: actUnit,
      estimatedTotal: estTotal,
      actualTotal: actTotal,
      variance,
    };

    this.budgetItems[idx] = updated;
    this.logAudit('UPDATE', 'BudgetItem', id, `actualTotal: ${prev.actualTotal}`, `actualTotal: ${actTotal}`, updated.eventId);
    return updated;
  }

  deleteBudgetItem(id: UUID): boolean {
    const idx = this.budgetItems.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    const deleted = this.budgetItems[idx];
    this.budgetItems.splice(idx, 1);
    this.logAudit('DELETE', 'BudgetItem', id, undefined, `Deleted budget line ${deleted.description}`, deleted.eventId);
    return true;
  }

  // Artists
  getArtists(eventId?: UUID): Artist[] {
    if (!eventId) return [...this.artists];
    return this.artists.filter((a) => a.eventId === eventId);
  }

  createArtist(artist: Omit<Artist, 'id'>): Artist {
    const newArtist: Artist = {
      ...artist,
      id: generateUniqueId('art'),
    };
    this.artists.unshift(newArtist);
    this.logAudit('CREATE', 'Artist', newArtist.id, undefined, `Added artist ${newArtist.name}`, newArtist.eventId);
    return newArtist;
  }

  updateArtist(id: UUID, data: Partial<Artist>): Artist | undefined {
    const idx = this.artists.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const updated: Artist = {
      ...this.artists[idx],
      ...data,
    };
    this.artists[idx] = updated;
    this.logAudit('UPDATE', 'Artist', id, undefined, `Updated artist ${updated.name}`, updated.eventId);
    return updated;
  }

  deleteArtist(id: UUID): boolean {
    const idx = this.artists.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    const deleted = this.artists[idx];
    this.artists.splice(idx, 1);
    this.logAudit('DELETE', 'Artist', id, undefined, `Removed artist ${deleted.name}`, deleted.eventId);
    return true;
  }

  // Vendors
  getVendors(): Vendor[] {
    return [...this.vendors];
  }

  createVendor(vendor: Omit<Vendor, 'id' | 'activeEventsCount'>): Vendor {
    const newVendor: Vendor = {
      ...vendor,
      id: generateUniqueId('vnd'),
      activeEventsCount: 0,
    };
    this.vendors.unshift(newVendor);
    this.logAudit('CREATE', 'Vendor', newVendor.id, undefined, `Created vendor ${newVendor.company}`);
    return newVendor;
  }

  updateVendor(id: UUID, data: Partial<Vendor>): Vendor | undefined {
    const idx = this.vendors.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    const prev = this.vendors[idx];
    const updated: Vendor = {
      ...prev,
      ...data,
    };
    this.vendors[idx] = updated;
    this.logAudit('UPDATE', 'Vendor', id, undefined, `Updated vendor ${updated.company}`);
    return updated;
  }

  deleteVendor(id: UUID): boolean {
    const idx = this.vendors.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    const deleted = this.vendors.splice(idx, 1)[0];
    this.logAudit('DELETE', 'Vendor', id, undefined, `Deleted vendor ${deleted.company}`);
    return true;
  }

  // Purchase Orders & Procurement
  getPurchaseOrders(eventId?: UUID): PurchaseOrder[] {
    if (!eventId) return [...this.purchaseOrders];
    return this.purchaseOrders.filter((p) => p.eventId === eventId);
  }

  createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'poNumber'>): PurchaseOrder {
    const count = this.purchaseOrders.length + 1;
    const poNumber = `PO-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...po,
      id: generateUniqueId('po'),
      poNumber,
    };
    this.purchaseOrders.unshift(newPO);
    this.logAudit('CREATE', 'PurchaseOrder', newPO.id, undefined, `Created PO ${poNumber} for ${newPO.vendorName}`, newPO.eventId);
    return newPO;
  }

  updatePurchaseOrderStatus(id: UUID, status: PurchaseOrder['status']): PurchaseOrder | undefined {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) return undefined;
    const prev = po.status;
    po.status = status;
    this.logAudit('STATUS_CHANGE', 'PurchaseOrder', id, prev, status, po.eventId);
    return po;
  }

  // Revenues
  getRevenues(eventId?: UUID): RevenueItem[] {
    if (!eventId) return [...this.revenues];
    return this.revenues.filter((r) => r.eventId === eventId);
  }

  createRevenue(rev: Omit<RevenueItem, 'id' | 'outstanding'>): RevenueItem {
    const outstanding = (rev.actualRevenue || 0) - (rev.received || 0);
    const newRev: RevenueItem = {
      ...rev,
      id: generateUniqueId('rev'),
      outstanding: outstanding > 0 ? outstanding : 0,
    };
    this.revenues.unshift(newRev);
    this.logAudit('CREATE', 'RevenueItem', newRev.id, undefined, `Created revenue line ${newRev.description}`, newRev.eventId);
    return newRev;
  }

  // Sponsorships & Strategic Partners
  getSponsorships(eventId?: UUID): SponsorshipItem[] {
    if (!eventId) return [...this.sponsorships];
    return this.sponsorships.filter((s) => s.eventId === eventId);
  }

  getSponsorshipById(id: UUID): SponsorshipItem | undefined {
    return this.sponsorships.find((s) => s.id === id);
  }

  createSponsorship(item: Omit<SponsorshipItem, 'id'>): SponsorshipItem {
    const newSponsor: SponsorshipItem = {
      ...item,
      id: generateUniqueId('sps'),
    };
    this.sponsorships.unshift(newSponsor);
    this.logAudit('CREATE', 'Sponsorship', newSponsor.id, undefined, `Added sponsorship partner ${newSponsor.sponsorName} (${newSponsor.tier})`, newSponsor.eventId);
    return newSponsor;
  }

  updateSponsorship(id: UUID, data: Partial<SponsorshipItem>): SponsorshipItem | undefined {
    const idx = this.sponsorships.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    const prev = this.sponsorships[idx];
    const updated: SponsorshipItem = {
      ...prev,
      ...data,
    };
    this.sponsorships[idx] = updated;
    this.logAudit('UPDATE', 'Sponsorship', id, undefined, `Updated sponsorship partner ${updated.sponsorName} (${updated.tier})`, updated.eventId);
    return updated;
  }

  deleteSponsorship(id: UUID): boolean {
    const idx = this.sponsorships.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const deleted = this.sponsorships.splice(idx, 1)[0];
    this.logAudit('DELETE', 'Sponsorship', id, undefined, `Removed sponsorship partner ${deleted.sponsorName}`, deleted.eventId);
    return true;
  }

  // Crew
  getCrew(eventId?: UUID): CrewAssignment[] {
    if (!eventId) return [...this.crew];
    return this.crew.filter((c) => c.eventId === eventId);
  }

  createCrew(crewMember: Omit<CrewAssignment, 'id'>): CrewAssignment {
    const newMember: CrewAssignment = {
      ...crewMember,
      id: generateUniqueId('crw'),
    };
    this.crew.unshift(newMember);
    this.logAudit('CREATE', 'CrewAssignment', newMember.id, undefined, `Assigned crew ${newMember.name} (${newMember.role})`, newMember.eventId);
    return newMember;
  }

  updateCrew(id: UUID, data: Partial<CrewAssignment>): CrewAssignment | undefined {
    const idx = this.crew.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const prev = this.crew[idx];
    const updated: CrewAssignment = {
      ...prev,
      ...data,
    };
    this.crew[idx] = updated;
    this.logAudit('UPDATE', 'CrewAssignment', id, undefined, `Updated crew ${updated.name} (${updated.role})`, updated.eventId);
    return updated;
  }

  deleteCrew(id: UUID): boolean {
    const idx = this.crew.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const deleted = this.crew.splice(idx, 1)[0];
    this.logAudit('DELETE', 'CrewAssignment', id, undefined, `Removed crew ${deleted.name}`, deleted.eventId);
    return true;
  }

  // Tasks
  getTasks(eventId?: UUID): Task[] {
    const raw = !eventId ? [...this.tasks] : this.tasks.filter((t) => t.eventId === eventId);
    const seen = new Set<string>();
    return raw.map((t, idx) => {
      if (seen.has(t.id)) {
        t.id = `${t.id}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(t.id);
      return t;
    });
  }

  createTask(task: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      ...task,
      id: generateUniqueId('tsk'),
    };
    this.tasks.unshift(newTask);
    this.logAudit('CREATE', 'Task', newTask.id, undefined, `Created task ${newTask.name}`, newTask.eventId);
    return newTask;
  }

  updateTaskStatus(id: UUID, status: Task['status']): Task | undefined {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    const prev = task.status;
    task.status = status;
    this.logAudit('STATUS_CHANGE', 'Task', id, prev, status, task.eventId);
    return task;
  }

  updateTask(id: UUID, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, updates);
    this.logAudit('UPDATE', 'Task', id, undefined, `Updated task ${task.name}`, task.eventId);
    return task;
  }

  deleteTask(id: UUID): boolean {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const task = this.tasks[idx];
    this.tasks.splice(idx, 1);
    this.logAudit('DELETE', 'Task', id, undefined, `Deleted task ${task.name}`, task.eventId);
    return true;
  }

  generateStandardChecklist(eventId: UUID): Task[] {
    const event = this.events.find((e) => e.id === eventId);
    const pm = event?.pics?.projectManager || this.currentUser.name;
    const baseDate = event?.loadInDate?.split('T')[0] || new Date().toISOString().split('T')[0];
    const eventDate = event?.eventDayDate?.split('T')[0] || baseDate;

    const templates = [
      {
        name: 'Perizinan Keramaian Polres & Surat Izin Tempat',
        category: 'Licensing & Permits',
        assignee: pm,
        priority: 'CRITICAL' as const,
        dueDate: baseDate,
        description: 'Pengurusan izin keramaian kepolisian, rekomendasi satgas, dan izin pemakaian venue.',
      },
      {
        name: 'Finalisasi & Tanda Tangan Kontrak Artist Hospitality Rider',
        category: 'Talent & Artist',
        assignee: event?.pics?.eventPIC || pm,
        priority: 'HIGH' as const,
        dueDate: baseDate,
        description: 'Konfirmasi riders panggung, hotel bintang 5, van VIP, dan hospitality backstage.',
      },
      {
        name: 'Inspeksi Struktur Rigging Panggung & Layher Scaffolding',
        category: 'Production & Staging',
        assignee: event?.pics?.productionPIC || 'Hendra Setiawan',
        priority: 'CRITICAL' as const,
        dueDate: event?.setupDate?.split('T')[0] || baseDate,
        description: 'Sertifikasi beban gantungan truss audio dan kekuatan rigging angin kencang.',
      },
      {
        name: 'Sound System Acoustic Tuning & FOH Calibration',
        category: 'Audio Visual',
        assignee: event?.pics?.technicalPIC || 'Ir. Johanes Handoko',
        priority: 'HIGH' as const,
        dueDate: event?.technicalRehearsalDate?.split('T')[0] || eventDate,
        description: 'Uji distribusi SPL line-array L-Acoustics K2 dan tuning delay tower.',
      },
      {
        name: 'General Rehearsal (GR) & Sinkronisasi Rundown Show Caller',
        category: 'Show Management',
        assignee: pm,
        priority: 'HIGH' as const,
        dueDate: event?.generalRehearsalDate?.split('T')[0] || eventDate,
        description: 'Simulasi rundown menit ke menit bersama Show Caller, Lighting Director, dan MC.',
      },
      {
        name: 'Briefing Keamanan, Barikade Mojo, & Jalur Evakuasi Medis',
        category: 'Safety & Security',
        assignee: 'Bambang Kusuma',
        priority: 'CRITICAL' as const,
        dueDate: eventDate,
        description: 'Pengecekan barikade depan FOH, pintu darurat, dan koordinasi dengan tim ambulans.',
      },
      {
        name: 'Bongkar Panggung (Strike) & Handover Venue Bersih',
        category: 'Operations',
        assignee: event?.pics?.productionPIC || 'Hendra Setiawan',
        priority: 'MEDIUM' as const,
        dueDate: event?.strikeDate?.split('T')[0] || eventDate,
        description: 'Load-out seluruh alat sewa vendor dan pembersihan sampah area stadion.',
      },
    ];

    const created: Task[] = [];
    templates.forEach((t) => {
      const task = this.createTask({
        eventId,
        name: t.name,
        category: t.category,
        assignee: t.assignee,
        priority: t.priority,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: t.dueDate,
        status: 'To Do',
        description: t.description,
        notes: 'Dibuat otomatis dari template standard checklist EO',
      });
      created.push(task);
    });

    return created;
  }

  // Rundown
  getRundown(eventId?: UUID): RundownItem[] {
    const list = eventId ? this.rundown.filter((r) => r.eventId === eventId) : [...this.rundown];
    return list.sort((a, b) => a.order - b.order);
  }

  createRundownItem(item: Omit<RundownItem, 'id' | 'order'>): RundownItem {
    const eventRundowns = this.getRundown(item.eventId);
    const order = eventRundowns.length + 1;
    const newItem: RundownItem = {
      ...item,
      id: generateUniqueId('rnd'),
      order,
    };
    this.rundown.push(newItem);
    this.logAudit('CREATE', 'RundownItem', newItem.id, undefined, `Added rundown segment ${newItem.segment}`, newItem.eventId);
    return newItem;
  }

  reorderRundown(eventId: UUID, newOrderedIds: UUID[]): RundownItem[] {
    newOrderedIds.forEach((id, idx) => {
      const item = this.rundown.find((r) => r.id === id && r.eventId === eventId);
      if (item) {
        item.order = idx + 1;
      }
    });
    return this.getRundown(eventId);
  }

  updateRundownItem(id: UUID, data: Partial<RundownItem>): RundownItem | undefined {
    const item = this.rundown.find((r) => r.id === id);
    if (!item) return undefined;
    Object.assign(item, data);
    this.logAudit('UPDATE', 'RundownItem', id, undefined, `Updated rundown segment ${item.segment}`, item.eventId);
    return item;
  }

  deleteRundownItem(id: UUID): void {
    const idx = this.rundown.findIndex((r) => r.id === id);
    if (idx !== -1) {
      const item = this.rundown[idx];
      this.rundown.splice(idx, 1);
      this.logAudit('DELETE', 'RundownItem', id, undefined, `Deleted rundown segment ${item.segment}`, item.eventId);
    }
  }

  // Risks
  getRisks(eventId?: UUID): RiskItem[] {
    if (!eventId) return [...this.risks];
    return this.risks.filter((r) => r.eventId === eventId);
  }

  createRisk(risk: Omit<RiskItem, 'id' | 'severity'>): RiskItem {
    const severity = (risk.probability || 1) * (risk.impact || 1);
    const newRisk: RiskItem = {
      ...risk,
      id: generateUniqueId('rsk'),
      severity,
    };
    this.risks.unshift(newRisk);
    this.logAudit('CREATE', 'RiskItem', newRisk.id, undefined, `Logged risk (${severity}): ${newRisk.description}`, newRisk.eventId);
    return newRisk;
  }

  // Approvals
  getApprovals(eventId?: UUID): ApprovalRequest[] {
    if (!eventId) return [...this.approvals];
    return this.approvals.filter((a) => a.eventId === eventId);
  }

  createApproval(app: Omit<ApprovalRequest, 'id' | 'date' | 'status'>): ApprovalRequest {
    const newApp: ApprovalRequest = {
      ...app,
      id: generateUniqueId('app'),
      date: new Date().toISOString(),
      status: 'PENDING',
    };
    this.approvals.unshift(newApp);
    this.logAudit('CREATE', 'Approval', newApp.id, undefined, `Requested approval for ${newApp.type}: ${newApp.reason}`, newApp.eventId);
    return newApp;
  }

  respondApproval(id: UUID, status: 'APPROVED' | 'REJECTED', comment?: string): ApprovalRequest | undefined {
    const app = this.approvals.find((a) => a.id === id);
    if (!app) return undefined;
    app.status = status;
    app.comment = comment;
    app.approver = this.currentUser.name;
    this.logAudit('APPROVE', 'Approval', id, 'PENDING', `${status} by ${this.currentUser.name}`, app.eventId);
    return app;
  }

  // Payments
  getPayments(eventId?: UUID): PaymentRecord[] {
    if (!eventId) return [...this.payments];
    return this.payments.filter((p) => p.eventId === eventId);
  }

  recordPayment(payment: Omit<PaymentRecord, 'id'>): PaymentRecord {
    const newPayment: PaymentRecord = {
      ...payment,
      id: generateUniqueId('pay'),
    };
    this.payments.unshift(newPayment);
    this.logAudit('CREATE', 'PaymentRecord', newPayment.id, undefined, `Recorded payment Rp ${newPayment.amount.toLocaleString('id-ID')} to ${newPayment.payee}`, newPayment.eventId);
    return newPayment;
  }

  // Documents
  getDocuments(eventId?: UUID): DocumentItem[] {
    if (!eventId) return [...this.documents];
    return this.documents.filter((d) => d.eventId === eventId);
  }

  addDocument(doc: Omit<DocumentItem, 'id' | 'uploadedAt'>): DocumentItem {
    const newDoc: DocumentItem = {
      ...doc,
      id: generateUniqueId('doc'),
      uploadedAt: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);
    this.logAudit('CREATE', 'DocumentItem', newDoc.id, undefined, `Uploaded document ${newDoc.name}`, newDoc.eventId);
    return newDoc;
  }

  // Audit Logs
  getAuditLogs(eventId?: UUID): AuditLogItem[] {
    if (!eventId) return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return this.auditLogs.filter((l) => l.eventId === eventId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private logAudit(
    action: AuditLogItem['action'],
    entity: string,
    entityId: UUID,
    previousValue?: string,
    newValue?: string,
    eventId?: UUID | null
  ) {
    const event = eventId ? this.events.find((e) => e.id === eventId) : undefined;
    const log: AuditLogItem = {
      id: generateUniqueId('aud'),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userRole: this.currentUser.role,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityId,
      eventId: eventId || undefined,
      eventName: event?.name,
      previousValue,
      newValue,
    };
    this.auditLogs.unshift(log);
  }

  // FUTURE ERP LOGISTICS INTEGRATION REQUIREMENTS
  getRequirements(eventId?: UUID): EventRequirement[] {
    if (!eventId) return [...this.requirements];
    return this.requirements.filter((r) => r.eventId === eventId);
  }

  createRequirement(req: Omit<EventRequirement, 'id' | 'externalSystem'>): EventRequirement {
    const newReq: EventRequirement = {
      ...req,
      id: generateUniqueId('req'),
      externalSystem: 'ERP_LOGISTICS',
    };
    this.requirements.unshift(newReq);
    this.logAudit('CREATE', 'EventRequirement', newReq.id, undefined, `Created logistics requirement: ${newReq.itemReference} (${newReq.quantity} ${newReq.unit})`, newReq.eventId);
    return newReq;
  }

  dispatchLogisticsRequest(eventId: UUID, requirementIds?: UUID[]): { success: boolean; message: string; payload: any } {
    const targetReqs = this.requirements.filter(
      (r) => r.eventId === eventId && (!requirementIds || requirementIds.includes(r.id))
    );

    targetReqs.forEach((r) => {
      if (r.status === 'DRAFT') {
        r.status = 'REQUESTED';
        r.externalReference = `RES-LOG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    });

    const event = this.getEventById(eventId);
    const payload = {
      source: 'EVENT_MANAGEMENT_SYSTEM',
      targetSystem: 'ERP_LOGISTICS (mcaesarar2-boop/erp-logistik)',
      event: {
        id: event?.id,
        code: event?.code,
        name: event?.name,
        loadInDate: event?.loadInDate,
        eventDayDate: event?.eventDayDate,
        loadOutDate: event?.loadOutDate,
        venue: event?.venueName,
        city: event?.city,
        technicalPIC: event?.pics.technicalPIC,
      },
      requirements: targetReqs.map((r) => ({
        requirementId: r.id,
        itemReference: r.itemReference,
        category: r.category,
        quantity: r.quantity,
        unit: r.unit,
        requiredDate: r.requiredDate,
        returnDate: r.returnDate,
        currentStatus: r.status,
        externalReference: r.externalReference,
      })),
      timestamp: new Date().toISOString(),
    };

    this.logAudit('UPDATE', 'EventRequirement', eventId, undefined, `Dispatched ${targetReqs.length} requirements to ERP Logistik API`, eventId);

    return {
      success: true,
      message: `Dispatched ${targetReqs.length} requirement(s) to ERP Logistics integration interface.`,
      payload,
    };
  }

  // Financial & Health Computations
  calculateEventHealth(event: Event): { score: number; status: HealthStatus; reasons: string[] } {
    const reasons: string[] = [];
    let score = 100;

    // 1. Financial check: Budget vs Actual
    const budgets = this.getBudgetItems(event.id);
    const overBudgetItems = budgets.filter((b) => b.variance < 0);
    if (overBudgetItems.length > 0) {
      score -= overBudgetItems.length * 8;
      reasons.push(`${overBudgetItems.length} pos budget mengalami pembengkakan (over budget).`);
    }

    // 2. Risk check: Critical Risks (severity >= 15)
    const risks = this.getRisks(event.id);
    const criticalRisks = risks.filter((r) => r.severity >= 15 && r.status === 'Open');
    if (criticalRisks.length > 0) {
      score -= criticalRisks.length * 15;
      reasons.push(`${criticalRisks.length} risiko berkategori kritis belum dimitigasi.`);
    }

    // 3. Task check: Overdue tasks
    const tasks = this.getTasks(event.id);
    const now = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.dueDate < now);
    if (overdueTasks.length > 0) {
      score -= overdueTasks.length * 6;
      reasons.push(`${overdueTasks.length} tugas melewati batas tanggal (overdue).`);
    }

    // 4. Artist contract confirmation
    const artists = this.getArtists(event.id);
    const unconfirmedArtists = artists.filter((a) => a.bookingStatus !== 'Contracted' && a.bookingStatus !== 'Confirmed');
    if (unconfirmedArtists.length > 0) {
      score -= unconfirmedArtists.length * 10;
      reasons.push(`${unconfirmedArtists.length} artis belum memiliki kontrak resmi.`);
    }

    // 5. Pending Approvals
    const approvals = this.getApprovals(event.id);
    const pendingApps = approvals.filter((a) => a.status === 'PENDING');
    if (pendingApps.length > 0) {
      score -= pendingApps.length * 4;
      reasons.push(`${pendingApps.length} permintaan approval masih tertunda.`);
    }

    score = Math.max(10, Math.min(100, score));

    let status: HealthStatus = 'HEALTHY';
    if (score < 60) status = 'CRITICAL';
    else if (score < 80) status = 'WARNING';

    return { score, status, reasons };
  }

  calculateFinancialSummary(event: Event) {
    const hydrated = this.hydrateEventRollup(event);
    const grossProfit = hydrated.actualRevenue - hydrated.actualCost;
    const estimatedProfit = hydrated.totalRevenue - hydrated.estimatedCost;
    const profitMargin = hydrated.actualRevenue > 0 ? (grossProfit / hydrated.actualRevenue) * 100 : 0;
    const remainingBudget = hydrated.totalBudget - hydrated.committedCost;

    const payments = this.getPayments(event.id);
    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const totalScheduled = payments.filter((p) => p.status === 'SCHEDULED' || p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const clientReceivable = Math.max(0, hydrated.actualRevenue - hydrated.receivedRevenue);

    return {
      totalBudget: hydrated.totalBudget,
      estimatedCost: hydrated.estimatedCost,
      actualCost: hydrated.actualCost,
      committedCost: hydrated.committedCost,
      totalRevenue: hydrated.totalRevenue,
      actualRevenue: hydrated.actualRevenue,
      receivedRevenue: hydrated.receivedRevenue,
      grossProfit,
      estimatedProfit,
      actualProfit: grossProfit,
      profitMargin,
      remainingBudget,
      totalPaid,
      outstandingPayment: totalScheduled,
      clientReceivable,
      vendorPayable: hydrated.committedCost - totalPaid,
    };
  }

  calculateGlobalKPIs() {
    const allEvents = this.getEvents();
    const activeEvents = allEvents.filter((e) => ['CONFIRMED', 'PRE_PRODUCTION', 'PRODUCTION', 'LIVE'].includes(e.status));
    const upcomingEvents = allEvents.filter((e) => ['DRAFT', 'PROPOSAL', 'NEGOTIATION'].includes(e.status));
    const completedEvents = allEvents.filter((e) => ['COMPLETED', 'SETTLEMENT', 'ARCHIVED'].includes(e.status));

    const totalProjectValue = allEvents.reduce((sum, e) => sum + e.totalBudget, 0);
    const totalBudget = allEvents.reduce((sum, e) => sum + e.totalBudget, 0);
    const totalActualCost = allEvents.reduce((sum, e) => sum + e.actualCost, 0);
    const totalRevenue = allEvents.reduce((sum, e) => sum + e.actualRevenue, 0);
    const totalProfit = totalRevenue - totalActualCost;

    const allPayments = this.payments;
    const outstandingPayable = allPayments.filter((p) => p.status === 'SCHEDULED' || p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const overduePayments = allPayments.filter((p) => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0);
    const totalClientReceivable = allEvents.reduce((sum, e) => sum + Math.max(0, e.actualRevenue - e.receivedRevenue), 0);

    const criticalRisksCount = this.risks.filter((r) => r.severity >= 15 && r.status !== 'Closed').length;
    const now = new Date().toISOString().split('T')[0];
    const tasksDueSoonCount = this.tasks.filter((t) => t.status !== 'Completed' && t.dueDate <= now).length;
    const pendingApprovalsCount = this.approvals.filter((a) => a.status === 'PENDING').length;

    return {
      activeEventsCount: activeEvents.length,
      upcomingEventsCount: upcomingEvents.length,
      completedEventsCount: completedEvents.length,
      totalEventsCount: allEvents.length,
      totalProjectValue,
      totalBudget,
      totalActualCost,
      totalRevenue,
      totalProfit,
      outstandingReceivable: totalClientReceivable,
      outstandingPayable,
      overduePayments,
      criticalRisksCount,
      tasksDueSoonCount,
      pendingApprovalsCount,
    };
  }
}

// Global Singleton Instance
export const db = new EventSystemStore();
