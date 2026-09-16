import { createBrowserClient } from './client';
import {
  Event,
  BudgetItem,
  Artist,
  Vendor,
  PurchaseOrder,
  RevenueItem,
  Client,
  Venue,
  CrewAssignment,
  Task,
  RundownItem,
  RiskItem,
  PaymentRecord,
  DocumentItem,
  SponsorshipItem,
} from '@/lib/types';

// Helper to get client safely (browser only, fallback in SSR)
function getSupabase() {
  return createBrowserClient();
}

// -----------------------------------------------------------------------------
// 1. CLIENTS SERVICE
// -----------------------------------------------------------------------------
export const clientsService = {
  async getAll(): Promise<Client[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('clients').select('*').order('company', { ascending: true });
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      company: row.company,
      contactPerson: row.contact_person,
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      industry: row.industry || 'Corporate',
      taxInformation: row.tax_information || '',
      notes: row.notes || '',
      totalEvents: row.total_events || 0,
      activeEvents: row.active_events || 0,
      completedEvents: row.completed_events || 0,
      totalRevenue: Number(row.total_revenue) || 0,
      outstandingReceivable: Number(row.outstanding_receivable) || 0,
    }));
  },

  async insert(client: Client): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('clients').insert({
      id: client.id,
      company: client.company,
      contact_person: client.contactPerson,
      email: client.email,
      phone: client.phone,
      address: client.address,
      industry: client.industry,
      tax_information: client.taxInformation,
      notes: client.notes,
      total_events: client.totalEvents || 0,
      active_events: client.activeEvents || 0,
      completed_events: client.completedEvents || 0,
      total_revenue: client.totalRevenue || 0,
      outstanding_receivable: client.outstandingReceivable || 0,
    });
    if (error) console.error('Error inserting client to Supabase:', error);
  },

  async update(id: string, data: Partial<Client>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.company !== undefined) payload.company = data.company;
    if (data.contactPerson !== undefined) payload.contact_person = data.contactPerson;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.address !== undefined) payload.address = data.address;
    if (data.industry !== undefined) payload.industry = data.industry;
    if (data.taxInformation !== undefined) payload.tax_information = data.taxInformation;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.totalRevenue !== undefined) payload.total_revenue = data.totalRevenue;
    if (data.outstandingReceivable !== undefined) payload.outstanding_receivable = data.outstandingReceivable;

    const { error } = await supabase.from('clients').update(payload).eq('id', id);
    if (error) console.error('Error updating client in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) console.error('Error deleting client in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 2. VENUES SERVICE
// -----------------------------------------------------------------------------
export const venuesService = {
  async getAll(): Promise<Venue[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('venues').select('*').order('name', { ascending: true });
    if (error) {
      console.error('Error fetching venues:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      capacity: Number(row.capacity) || 0,
      type: row.type,
      contactPerson: row.contact_person || '',
      contactPhone: row.contact_phone || '',
      rentalCost: Number(row.rental_cost) || 0,
      parkingCapacity: row.parking_capacity || '',
      loadingAreaSpecs: row.loading_area_specs || '',
      powerCapacity: row.power_capacity || '',
      restrictions: row.restrictions || '',
      curfewTime: row.curfew_time || '',
      notes: row.notes || '',
    }));
  },

  async insert(venue: Venue): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('venues').insert({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      capacity: venue.capacity,
      type: venue.type,
      contact_person: venue.contactPerson,
      contact_phone: venue.contactPhone,
      rental_cost: venue.rentalCost,
      parking_capacity: venue.parkingCapacity,
      loading_area_specs: venue.loadingAreaSpecs,
      power_capacity: venue.powerCapacity,
      restrictions: venue.restrictions,
      curfew_time: venue.curfewTime,
      notes: venue.notes,
    });
    if (error) console.error('Error inserting venue to Supabase:', error);
  },

  async update(id: string, data: Partial<Venue>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.address !== undefined) payload.address = data.address;
    if (data.city !== undefined) payload.city = data.city;
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.type !== undefined) payload.type = data.type;
    if (data.contactPerson !== undefined) payload.contact_person = data.contactPerson;
    if (data.contactPhone !== undefined) payload.contact_phone = data.contactPhone;
    if (data.rentalCost !== undefined) payload.rental_cost = data.rentalCost;
    if (data.parkingCapacity !== undefined) payload.parking_capacity = data.parkingCapacity;
    if (data.loadingAreaSpecs !== undefined) payload.loading_area_specs = data.loadingAreaSpecs;
    if (data.powerCapacity !== undefined) payload.power_capacity = data.powerCapacity;
    if (data.restrictions !== undefined) payload.restrictions = data.restrictions;
    if (data.curfewTime !== undefined) payload.curfew_time = data.curfewTime;
    if (data.notes !== undefined) payload.notes = data.notes;

    const { error } = await supabase.from('venues').update(payload).eq('id', id);
    if (error) console.error('Error updating venue in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('venues').delete().eq('id', id);
    if (error) console.error('Error deleting venue in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 3. VENDORS SERVICE
// -----------------------------------------------------------------------------
export const vendorsService = {
  async getAll(): Promise<Vendor[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('vendors').select('*').order('company', { ascending: true });
    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      company: row.company,
      category: row.category,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email || '',
      address: row.address || '',
      npwp: row.npwp || '',
      bankName: row.bank_name || 'BCA',
      bankAccountNumber: row.bank_account_number || '',
      bankAccountHolder: row.bank_account_holder || '',
      rating: Number(row.rating) || 5.0,
      notes: row.notes || '',
      activeEventsCount: row.active_events_count || 0,
    }));
  },

  async insert(vendor: Vendor): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('vendors').insert({
      id: vendor.id,
      name: vendor.name,
      company: vendor.company,
      category: vendor.category,
      contact_person: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      npwp: vendor.npwp,
      bank_name: vendor.bankName,
      bank_account_number: vendor.bankAccountNumber,
      bank_account_holder: vendor.bankAccountHolder,
      rating: vendor.rating,
      notes: vendor.notes,
      active_events_count: vendor.activeEventsCount || 0,
    });
    if (error) console.error('Error inserting vendor to Supabase:', error);
  },

  async update(id: string, data: Partial<Vendor>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.company !== undefined) payload.company = data.company;
    if (data.category !== undefined) payload.category = data.category;
    if (data.contactPerson !== undefined) payload.contact_person = data.contactPerson;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.address !== undefined) payload.address = data.address;
    if (data.npwp !== undefined) payload.npwp = data.npwp;
    if (data.bankName !== undefined) payload.bank_name = data.bankName;
    if (data.bankAccountNumber !== undefined) payload.bank_account_number = data.bankAccountNumber;
    if (data.bankAccountHolder !== undefined) payload.bank_account_holder = data.bankAccountHolder;
    if (data.rating !== undefined) payload.rating = data.rating;
    if (data.notes !== undefined) payload.notes = data.notes;

    const { error } = await supabase.from('vendors').update(payload).eq('id', id);
    if (error) console.error('Error updating vendor in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) console.error('Error deleting vendor in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 4. EVENTS SERVICE
// -----------------------------------------------------------------------------
export const eventsService = {
  async getAll(): Promise<Event[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('events').select('*').order('start_date', { ascending: true });
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type,
      clientId: row.client_id || '',
      clientName: row.client_name || '',
      clientContact: row.client_contact || '',
      description: row.description || '',
      objective: row.objective || '',
      theme: row.theme || '',
      venueId: row.venue_id || '',
      venueName: row.venue_name || '',
      venueAddress: row.venue_address || '',
      city: row.city || '',
      province: row.province || '',
      country: row.country || 'Indonesia',
      startDate: row.start_date,
      endDate: row.end_date,
      loadInDate: row.load_in_date || row.start_date,
      setupDate: row.setup_date || row.start_date,
      technicalRehearsalDate: row.technical_rehearsal_date || row.start_date,
      generalRehearsalDate: row.general_rehearsal_date || row.start_date,
      eventDayDate: row.event_day_date || row.start_date,
      strikeDate: row.strike_date || row.end_date,
      loadOutDate: row.load_out_date || row.end_date,
      expectedAttendance: Number(row.expected_attendance) || 0,
      actualAttendance: Number(row.actual_attendance) || 0,
      status: row.status,
      priority: row.priority,
      pics: row.pics || {},
      totalBudget: Number(row.total_budget) || 0,
      estimatedCost: Number(row.estimated_cost) || 0,
      actualCost: Number(row.actual_cost) || 0,
      committedCost: Number(row.committed_cost) || 0,
      totalRevenue: Number(row.total_revenue) || 0,
      actualRevenue: Number(row.actual_revenue) || 0,
      receivedRevenue: Number(row.received_revenue) || 0,
      currency: row.currency || 'IDR',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: row.tags || [],
      customMilestones: row.custom_milestones || [],
    }));
  },

  async insert(event: Event): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('events').insert({
      id: event.id,
      code: event.code,
      name: event.name,
      type: event.type,
      client_id: event.clientId || null,
      client_name: event.clientName,
      client_contact: event.clientContact,
      description: event.description,
      objective: event.objective,
      theme: event.theme,
      venue_id: event.venueId || null,
      venue_name: event.venueName,
      venue_address: event.venueAddress,
      city: event.city,
      province: event.province,
      country: event.country,
      start_date: event.startDate,
      end_date: event.endDate,
      load_in_date: event.loadInDate,
      setup_date: event.setupDate,
      technical_rehearsal_date: event.technicalRehearsalDate,
      general_rehearsal_date: event.generalRehearsalDate,
      event_day_date: event.eventDayDate,
      strike_date: event.strikeDate,
      load_out_date: event.loadOutDate,
      expected_attendance: event.expectedAttendance,
      actual_attendance: event.actualAttendance,
      status: event.status,
      priority: event.priority,
      pics: event.pics,
      total_budget: event.totalBudget,
      estimated_cost: event.estimatedCost,
      actual_cost: event.actualCost,
      committed_cost: event.committedCost,
      total_revenue: event.totalRevenue,
      actual_revenue: event.actualRevenue,
      received_revenue: event.receivedRevenue,
      currency: event.currency,
      tags: event.tags,
      custom_milestones: event.customMilestones || [],
    });
    if (error) console.error('Error inserting event to Supabase:', error);
  },

  async update(id: string, data: Partial<Event>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.type = data.type;
    if (data.status !== undefined) payload.status = data.status;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.description !== undefined) payload.description = data.description;
    if (data.objective !== undefined) payload.objective = data.objective;
    if (data.theme !== undefined) payload.theme = data.theme;
    if (data.clientId !== undefined) payload.client_id = data.clientId;
    if (data.clientName !== undefined) payload.client_name = data.clientName;
    if (data.clientContact !== undefined) payload.client_contact = data.clientContact;
    if (data.venueId !== undefined) payload.venue_id = data.venueId;
    if (data.venueName !== undefined) payload.venue_name = data.venueName;
    if (data.venueAddress !== undefined) payload.venue_address = data.venueAddress;
    if (data.city !== undefined) payload.city = data.city;
    if (data.province !== undefined) payload.province = data.province;
    if (data.startDate !== undefined) payload.start_date = data.startDate;
    if (data.endDate !== undefined) payload.end_date = data.endDate;
    if (data.loadInDate !== undefined) payload.load_in_date = data.loadInDate;
    if (data.setupDate !== undefined) payload.setup_date = data.setupDate;
    if (data.technicalRehearsalDate !== undefined) payload.technical_rehearsal_date = data.technicalRehearsalDate;
    if (data.generalRehearsalDate !== undefined) payload.general_rehearsal_date = data.generalRehearsalDate;
    if (data.eventDayDate !== undefined) payload.event_day_date = data.eventDayDate;
    if (data.strikeDate !== undefined) payload.strike_date = data.strikeDate;
    if (data.loadOutDate !== undefined) payload.load_out_date = data.loadOutDate;
    if (data.expectedAttendance !== undefined) payload.expected_attendance = data.expectedAttendance;
    if (data.actualAttendance !== undefined) payload.actual_attendance = data.actualAttendance;
    if (data.pics !== undefined) payload.pics = data.pics;
    if (data.totalBudget !== undefined) payload.total_budget = data.totalBudget;
    if (data.estimatedCost !== undefined) payload.estimated_cost = data.estimatedCost;
    if (data.actualCost !== undefined) payload.actual_cost = data.actualCost;
    if (data.committedCost !== undefined) payload.committed_cost = data.committedCost;
    if (data.totalRevenue !== undefined) payload.total_revenue = data.totalRevenue;
    if (data.actualRevenue !== undefined) payload.actual_revenue = data.actualRevenue;
    if (data.receivedRevenue !== undefined) payload.received_revenue = data.receivedRevenue;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.customMilestones !== undefined) payload.custom_milestones = data.customMilestones;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('events').update(payload).eq('id', id);
    if (error) console.error('Error updating event in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error('Error deleting event in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 5. SPONSORSHIPS SERVICE
// -----------------------------------------------------------------------------
export const sponsorshipsService = {
  async getAll(): Promise<SponsorshipItem[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('sponsorships').select('*').order('contribution_value', { ascending: false });
    if (error) {
      console.error('Error fetching sponsorships:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      sponsorName: row.sponsor_name,
      brandName: row.brand_name || row.sponsor_name,
      type: row.type,
      group: row.group_name,
      tier: row.tier,
      contributionValue: Number(row.contribution_value) || 0,
      receivedValue: Number(row.received_value) || 0,
      paymentStatus: row.payment_status,
      status: row.status,
      contactPerson: row.contact_person || '',
      phone: row.phone || '',
      email: row.email || '',
      deliverables: row.deliverables || '',
      inKindDetails: row.in_kind_details || '',
      contractNumber: row.contract_number || '',
      contractDate: row.contract_date || '',
      logoUrl: row.logo_url || undefined,
      notes: row.notes || '',
    }));
  },

  async insert(item: SponsorshipItem): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('sponsorships').insert({
      id: item.id,
      event_id: item.eventId || null,
      sponsor_name: item.sponsorName,
      brand_name: item.brandName,
      type: item.type,
      group_name: item.group,
      tier: item.tier,
      contribution_value: item.contributionValue,
      received_value: item.receivedValue || 0,
      payment_status: item.paymentStatus || 'SCHEDULED',
      status: item.status,
      contact_person: item.contactPerson,
      phone: item.phone,
      email: item.email,
      deliverables: item.deliverables,
      in_kind_details: item.inKindDetails,
      contract_number: item.contractNumber,
      contract_date: item.contractDate || null,
      logo_url: item.logoUrl || null,
      notes: item.notes,
    });
    if (error) console.error('Error inserting sponsorship to Supabase:', error);
  },

  async update(id: string, data: Partial<SponsorshipItem>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.sponsorName !== undefined) payload.sponsor_name = data.sponsorName;
    if (data.brandName !== undefined) payload.brand_name = data.brandName;
    if (data.type !== undefined) payload.type = data.type;
    if (data.group !== undefined) payload.group_name = data.group;
    if (data.tier !== undefined) payload.tier = data.tier;
    if (data.contributionValue !== undefined) payload.contribution_value = data.contributionValue;
    if (data.receivedValue !== undefined) payload.received_value = data.receivedValue;
    if (data.paymentStatus !== undefined) payload.payment_status = data.paymentStatus;
    if (data.status !== undefined) payload.status = data.status;
    if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl || null;

    const { error } = await supabase.from('sponsorships').update(payload).eq('id', id);
    if (error) console.error('Error updating sponsorship in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('sponsorships').delete().eq('id', id);
    if (error) console.error('Error deleting sponsorship in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 6. ARTISTS SERVICE
// -----------------------------------------------------------------------------
export const artistsService = {
  async getAll(): Promise<Artist[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('artists').select('*').order('type', { ascending: true }).order('name', { ascending: true });
    if (error) {
      console.error('Error fetching artists:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      name: row.name,
      type: row.type,
      agency: row.agency || '',
      management: row.management || '',
      contactPerson: row.contact_person || '',
      phone: row.phone || '',
      email: row.email || '',
      genre: row.genre || '',
      country: row.country || 'Indonesia',
      city: row.city || '',
      currency: row.currency || 'IDR',
      performanceDuration: Number(row.performance_duration) || 60,
      entourageCount: Number(row.entourage_count) || 1,
      contractUrl: row.contract_url,
      setTime: row.set_time,
      arrivalTime: row.arrival_time,
      departureTime: row.departure_time,
      fee: Number(row.fee) || 0,
      tax: Number(row.tax) || 0,
      transportAllowance: Number(row.transport_allowance) || 0,
      accommodationDetail: row.accommodation_detail,
      bookingStatus: row.booking_status,
      paymentStatus: row.payment_status,
      contractStatus: row.contract_status,
      technicalRider: row.technical_rider || {},
      hospitalityRider: row.hospitality_rider || {},
      contract: row.contract,
      notes: row.notes || '',
    }));
  },

  async insert(artist: Artist): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('artists').insert({
      id: artist.id,
      event_id: artist.eventId || null,
      name: artist.name,
      type: artist.type,
      agency: artist.agency,
      management: artist.management,
      contact_person: artist.contactPerson,
      phone: artist.phone,
      email: artist.email,
      genre: artist.genre,
      country: artist.country,
      city: artist.city,
      currency: artist.currency,
      performance_duration: artist.performanceDuration,
      entourage_count: artist.entourageCount,
      contract_url: artist.contractUrl,
      set_time: artist.setTime,
      arrival_time: artist.arrivalTime,
      departure_time: artist.departureTime,
      fee: artist.fee,
      tax: artist.tax,
      transport_allowance: artist.transportAllowance,
      accommodation_detail: artist.accommodationDetail,
      booking_status: artist.bookingStatus,
      payment_status: artist.paymentStatus,
      contract_status: artist.contractStatus,
      technical_rider: artist.technicalRider,
      hospitality_rider: artist.hospitalityRider,
      contract: artist.contract,
      notes: artist.notes,
    });
    if (error) console.error('Error inserting artist to Supabase:', error);
  },

  async update(id: string, data: Partial<Artist>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.type = data.type;
    if (data.agency !== undefined) payload.agency = data.agency;
    if (data.management !== undefined) payload.management = data.management;
    if (data.contactPerson !== undefined) payload.contact_person = data.contactPerson;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.genre !== undefined) payload.genre = data.genre;
    if (data.country !== undefined) payload.country = data.country;
    if (data.city !== undefined) payload.city = data.city;
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.performanceDuration !== undefined) payload.performance_duration = data.performanceDuration;
    if (data.entourageCount !== undefined) payload.entourage_count = data.entourageCount;
    if (data.contractUrl !== undefined) payload.contract_url = data.contractUrl;
    if (data.setTime !== undefined) payload.set_time = data.setTime;
    if (data.arrivalTime !== undefined) payload.arrival_time = data.arrivalTime;
    if (data.departureTime !== undefined) payload.departure_time = data.departureTime;
    if (data.fee !== undefined) payload.fee = data.fee;
    if (data.tax !== undefined) payload.tax = data.tax;
    if (data.transportAllowance !== undefined) payload.transport_allowance = data.transportAllowance;
    if (data.accommodationDetail !== undefined) payload.accommodation_detail = data.accommodationDetail;
    if (data.bookingStatus !== undefined) payload.booking_status = data.bookingStatus;
    if (data.paymentStatus !== undefined) payload.payment_status = data.paymentStatus;
    if (data.contractStatus !== undefined) payload.contract_status = data.contractStatus;
    if (data.technicalRider !== undefined) payload.technical_rider = data.technicalRider;
    if (data.hospitalityRider !== undefined) payload.hospitality_rider = data.hospitalityRider;
    if (data.contract !== undefined) payload.contract = data.contract;
    if (data.notes !== undefined) payload.notes = data.notes;

    const { error } = await supabase.from('artists').update(payload).eq('id', id);
    if (error) console.error('Error updating artist in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('artists').delete().eq('id', id);
    if (error) console.error('Error deleting artist in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 7. TASKS SERVICE
// -----------------------------------------------------------------------------
export const tasksService = {
  async getAll(): Promise<Task[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      name: row.name,
      description: row.description || '',
      category: row.category,
      assignee: row.assignee,
      priority: row.priority,
      startDate: row.start_date,
      dueDate: row.due_date,
      status: row.status,
      dependency: row.dependency,
      notes: row.notes,
    }));
  },

  async insert(task: Task): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      event_id: task.eventId,
      name: task.name,
      description: task.description,
      category: task.category,
      assignee: task.assignee,
      priority: task.priority,
      start_date: task.startDate,
      due_date: task.dueDate,
      status: task.status,
      dependency: task.dependency,
      notes: task.notes,
    });
    if (error) console.error('Error inserting task to Supabase:', error);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (error) console.error('Error updating task in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Error deleting task in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 8. BUDGET ITEMS SERVICE
// -----------------------------------------------------------------------------
export const budgetService = {
  async getAll(): Promise<BudgetItem[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('budget_items').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching budget items:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      category: row.category,
      categoryLabel: row.category_label,
      subcategory: row.subcategory,
      description: row.description,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      quantity: Number(row.quantity) || 1,
      unit: row.unit || 'Paket',
      estimatedUnitCost: Number(row.estimated_unit_cost) || 0,
      estimatedTotal: Number(row.estimated_total) || 0,
      actualUnitCost: Number(row.actual_unit_cost) || 0,
      actualTotal: Number(row.actual_total) || 0,
      variance: Number(row.variance) || 0,
      taxRate: Number(row.tax_rate) || 0,
      taxAmount: Number(row.tax_amount) || 0,
      discount: Number(row.discount) || 0,
      currency: row.currency || 'IDR',
      paymentStatus: row.payment_status,
      approvalStatus: row.approval_status,
      status: row.status,
      dueDate: row.due_date,
      notes: row.notes,
      paidAmount: Number(row.paid_amount) || 0,
    }));
  },

  async insert(item: BudgetItem): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('budget_items').insert({
      id: item.id,
      event_id: item.eventId,
      category: item.category,
      category_label: item.categoryLabel,
      subcategory: item.subcategory,
      description: item.description,
      vendor_id: item.vendorId || null,
      vendor_name: item.vendorName,
      quantity: item.quantity,
      unit: item.unit,
      estimated_unit_cost: item.estimatedUnitCost,
      estimated_total: item.estimatedTotal,
      actual_unit_cost: item.actualUnitCost,
      actual_total: item.actualTotal,
      tax_rate: item.taxRate || 0,
      tax_amount: item.taxAmount || 0,
      discount: item.discount || 0,
      currency: item.currency || 'IDR',
      payment_status: item.paymentStatus || 'Pending',
      approval_status: item.approvalStatus || 'APPROVED',
      status: item.status || 'Approved',
      due_date: item.dueDate || null,
      notes: item.notes,
      paid_amount: item.paidAmount || 0,
    });
    if (error) console.error('Error inserting budget item to Supabase:', error);
  },

  async update(id: string, data: Partial<BudgetItem>): Promise<void> {
    const supabase = getSupabase();
    const payload: any = {};
    if (data.category !== undefined) payload.category = data.category;
    if (data.categoryLabel !== undefined) payload.category_label = data.categoryLabel;
    if (data.subcategory !== undefined) payload.subcategory = data.subcategory;
    if (data.description !== undefined) payload.description = data.description;
    if (data.vendorId !== undefined) payload.vendor_id = data.vendorId;
    if (data.vendorName !== undefined) payload.vendor_name = data.vendorName;
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.unit !== undefined) payload.unit = data.unit;
    if (data.estimatedUnitCost !== undefined) payload.estimated_unit_cost = data.estimatedUnitCost;
    if (data.estimatedTotal !== undefined) payload.estimated_total = data.estimatedTotal;
    if (data.actualUnitCost !== undefined) payload.actual_unit_cost = data.actualUnitCost;
    if (data.actualTotal !== undefined) payload.actual_total = data.actualTotal;
    if (data.variance !== undefined) payload.variance = data.variance;
    if (data.taxRate !== undefined) payload.tax_rate = data.taxRate;
    if (data.taxAmount !== undefined) payload.tax_amount = data.taxAmount;
    if (data.discount !== undefined) payload.discount = data.discount;
    if (data.status !== undefined) payload.status = data.status;
    if (data.paymentStatus !== undefined) payload.payment_status = data.paymentStatus;
    if (data.approvalStatus !== undefined) payload.approval_status = data.approvalStatus;
    if (data.paidAmount !== undefined) payload.paid_amount = data.paidAmount;
    if (data.dueDate !== undefined) payload.due_date = data.dueDate;
    if (data.notes !== undefined) payload.notes = data.notes;

    const { error } = await supabase.from('budget_items').update(payload).eq('id', id);
    if (error) console.error('Error updating budget item in Supabase:', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('budget_items').delete().eq('id', id);
    if (error) console.error('Error deleting budget item in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 9. PURCHASE ORDERS SERVICE
// -----------------------------------------------------------------------------
export const purchaseOrdersService = {
  async getAll(): Promise<PurchaseOrder[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching POs:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      poNumber: row.po_number,
      eventId: row.event_id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      date: row.date,
      deliveryDate: row.delivery_date,
      issuedBy: row.issued_by,
      expectedDelivery: row.expected_delivery,
      paymentTerms: row.payment_terms,
      subtotal: Number(row.subtotal) || 0,
      tax: Number(row.tax) || 0,
      discount: Number(row.discount) || 0,
      total: Number(row.total) || 0,
      paidAmount: Number(row.paid_amount) || 0,
      status: row.status,
      items: row.items || [],
      approvalRequired: row.approval_required,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
    }));
  },

  async insert(po: PurchaseOrder): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('purchase_orders').insert({
      id: po.id,
      po_number: po.poNumber,
      event_id: po.eventId,
      vendor_id: po.vendorId || null,
      vendor_name: po.vendorName,
      date: po.date || null,
      delivery_date: po.deliveryDate || null,
      issued_by: po.issuedBy,
      expected_delivery: po.expectedDelivery,
      payment_terms: po.paymentTerms,
      subtotal: po.subtotal,
      tax: po.tax,
      discount: po.discount || 0,
      total: po.total,
      paid_amount: po.paidAmount || 0,
      status: po.status,
      items: po.items || [],
      approval_required: po.approvalRequired || false,
      approved_by: po.approvedBy,
      approved_at: po.approvedAt || null,
    });
    if (error) console.error('Error inserting PO to Supabase:', error);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);
    if (error) console.error('Error updating PO in Supabase:', error);
  },
};

// -----------------------------------------------------------------------------
// 10. REVENUES SERVICE
// -----------------------------------------------------------------------------
export const revenuesService = {
  async getAll(): Promise<RevenueItem[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('revenues').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching revenues:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      category: row.category,
      description: row.description,
      targetRevenue: Number(row.target_revenue) || 0,
      estimatedRevenue: Number(row.estimated_revenue) || 0,
      actualRevenue: Number(row.actual_revenue) || 0,
      received: Number(row.received) || 0,
      outstanding: Number(row.outstanding) || 0,
      dueDate: row.due_date,
      paymentStatus: row.payment_status,
      status: row.status,
      payerName: row.payer_name,
      notes: row.notes,
    }));
  },

  async insert(rev: RevenueItem): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('revenues').insert({
      id: rev.id,
      event_id: rev.eventId,
      category: rev.category,
      description: rev.description,
      target_revenue: rev.targetRevenue || rev.estimatedRevenue || 0,
      estimated_revenue: rev.estimatedRevenue || 0,
      actual_revenue: rev.actualRevenue || 0,
      received: rev.received || 0,
      due_date: rev.dueDate || null,
      payment_status: rev.paymentStatus || 'PARTIALLY_PAID',
      status: rev.status || 'Partial',
      payer_name: rev.payerName,
      notes: rev.notes,
    });
    if (error) console.error('Error inserting revenue to Supabase:', error);
  },
};

