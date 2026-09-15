import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import {
  SEED_CLIENTS,
  SEED_VENUES,
  SEED_VENDORS,
  SEED_EVENTS,
  SEED_SPONSORSHIPS,
  SEED_ARTISTS,
  SEED_TASKS,
  SEED_BUDGET_ITEMS,
  SEED_PURCHASE_ORDERS,
  SEED_REVENUES,
  SEED_CREW,
  SEED_RUNDOWN,
  SEED_RISKS,
  SEED_DOCUMENTS,
  SEED_PAYMENTS,
} from '../lib/db/seed';

// 1. Read Supabase configuration from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach((line) => {
  const l = line.trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = l.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = l.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

function parseDateOrNull(d: any) {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parseDateOnlyOrNull(d: any) {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
}

async function runSeed() {
  console.log('--- STARTING SUPABASE SEEDING ---');

  // 1. Clients
  console.log('Seeding Clients:', SEED_CLIENTS.length);
  const clientsData = SEED_CLIENTS.map((c) => ({
    id: c.id,
    company: c.company,
    contact_person: c.contactPerson,
    email: c.email,
    phone: c.phone,
    address: c.address,
    industry: c.industry,
    tax_information: c.taxInformation,
    notes: c.notes,
    total_events: c.totalEvents,
    active_events: c.activeEvents,
    completed_events: c.completedEvents,
    total_revenue: c.totalRevenue,
    outstanding_receivable: c.outstandingReceivable,
  }));
  const { error: errClients } = await supabase.from('clients').upsert(clientsData);
  if (errClients) console.error('Error seeding clients:', errClients);

  // 2. Venues
  console.log('Seeding Venues:', SEED_VENUES.length);
  const venuesData = SEED_VENUES.map((v) => ({
    id: v.id,
    name: v.name,
    address: v.address,
    city: v.city,
    capacity: v.capacity,
    type: v.type,
    contact_person: v.contactPerson,
    contact_phone: v.contactPhone,
    rental_cost: v.rentalCost,
    parking_capacity: v.parkingCapacity,
    loading_area_specs: v.loadingAreaSpecs,
    power_capacity: v.powerCapacity,
    restrictions: v.restrictions,
    curfew_time: v.curfewTime,
    notes: v.notes,
  }));
  const { error: errVenues } = await supabase.from('venues').upsert(venuesData);
  if (errVenues) console.error('Error seeding venues:', errVenues);

  // 3. Vendors
  console.log('Seeding Vendors:', SEED_VENDORS.length);
  const vendorsData = SEED_VENDORS.map((v) => ({
    id: v.id,
    name: v.name,
    company: v.company,
    category: v.category,
    contact_person: v.contactPerson,
    phone: v.phone,
    email: v.email,
    address: v.address,
    npwp: v.npwp,
    bank_name: v.bankName,
    bank_account_number: v.bankAccountNumber,
    bank_account_holder: v.bankAccountHolder,
    rating: v.rating,
    notes: v.notes,
    active_events_count: v.activeEventsCount,
  }));
  const { error: errVendors } = await supabase.from('vendors').upsert(vendorsData);
  if (errVendors) console.error('Error seeding vendors:', errVendors);

  // 4. Events
  console.log('Seeding Events:', SEED_EVENTS.length);
  const eventsData = SEED_EVENTS.map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
    type: e.type,
    client_id: e.clientId,
    client_name: e.clientName,
    client_contact: e.clientContact,
    description: e.description,
    objective: e.objective,
    theme: e.theme,
    venue_id: e.venueId,
    venue_name: e.venueName,
    venue_address: e.venueAddress,
    city: e.city,
    province: e.province,
    country: e.country,
    start_date: parseDateOrNull(e.startDate) || new Date().toISOString(),
    end_date: parseDateOrNull(e.endDate) || new Date().toISOString(),
    load_in_date: parseDateOrNull(e.loadInDate),
    setup_date: parseDateOrNull(e.setupDate),
    technical_rehearsal_date: parseDateOrNull(e.technicalRehearsalDate),
    general_rehearsal_date: parseDateOrNull(e.generalRehearsalDate),
    event_day_date: parseDateOrNull(e.eventDayDate),
    strike_date: parseDateOrNull(e.strikeDate),
    load_out_date: parseDateOrNull(e.loadOutDate),
    expected_attendance: e.expectedAttendance,
    actual_attendance: e.actualAttendance,
    status: e.status,
    priority: e.priority,
    pics: e.pics,
    total_budget: e.totalBudget,
    estimated_cost: e.estimatedCost,
    actual_cost: e.actualCost,
    committed_cost: e.committedCost,
    total_revenue: e.totalRevenue,
    actual_revenue: e.actualRevenue,
    received_revenue: e.receivedRevenue,
    currency: e.currency,
    tags: e.tags,
    custom_milestones: e.customMilestones || [],
  }));
  const { error: errEvents } = await supabase.from('events').upsert(eventsData);
  if (errEvents) console.error('Error seeding events:', errEvents);

  // 5. Sponsorships
  console.log('Seeding Sponsorships:', SEED_SPONSORSHIPS.length);
  const validEventIds = new Set(SEED_EVENTS.map((e) => e.id));
  const sponsorshipsData = SEED_SPONSORSHIPS.map((s) => ({
    id: s.id,
    event_id: s.eventId && validEventIds.has(s.eventId) ? s.eventId : null,
    sponsor_name: s.sponsorName,
    brand_name: s.brandName,
    type: s.type,
    group_name: s.group,
    tier: s.tier,
    contribution_value: s.contributionValue,
    received_value: s.receivedValue || 0,
    payment_status: s.paymentStatus || 'SCHEDULED',
    status: s.status,
    contact_person: s.contactPerson,
    phone: s.phone,
    email: s.email,
    deliverables: s.deliverables,
    in_kind_details: s.inKindDetails,
    contract_number: s.contractNumber,
    contract_date: parseDateOnlyOrNull(s.contractDate),
    notes: s.notes,
  }));
  const { error: errSponsors } = await supabase.from('sponsorships').upsert(sponsorshipsData);
  if (errSponsors) console.error('Error seeding sponsorships:', errSponsors);

  // 6. Artists
  console.log('Seeding Artists:', SEED_ARTISTS.length);
  const artistsData = SEED_ARTISTS.filter((a) => !a.eventId || validEventIds.has(a.eventId)).map((a) => ({
    id: a.id,
    event_id: a.eventId || null,
    name: a.name,
    type: a.type,
    agency: a.agency,
    management: a.management,
    contact_person: a.contactPerson,
    phone: a.phone,
    email: a.email,
    genre: a.genre,
    country: a.country,
    city: a.city,
    currency: a.currency || 'IDR',
    performance_duration: a.performanceDuration || a.performanceDurationMinutes || 60,
    entourage_count: a.entourageCount || 1,
    contract_url: a.contractUrl,
    set_time: a.setTime,
    arrival_time: a.arrivalTime,
    departure_time: a.departureTime,
    fee: a.fee || 0,
    tax: a.tax || 0,
    transport_allowance: a.transportAllowance || 0,
    accommodation_detail: a.accommodationDetail,
    booking_status: a.bookingStatus,
    payment_status: a.paymentStatus || 'SCHEDULED',
    contract_status: a.contractStatus,
    technical_rider: a.technicalRider || {},
    hospitality_rider: a.hospitalityRider || {},
    contract: a.contract || {},
    notes: a.notes,
  }));
  const { error: errArtists } = await supabase.from('artists').upsert(artistsData);
  if (errArtists) console.error('Error seeding artists:', errArtists);

  // 7. Tasks
  console.log('Seeding Tasks:', SEED_TASKS.length);
  const tasksData = SEED_TASKS.filter((t) => validEventIds.has(t.eventId)).map((t) => ({
    id: t.id,
    event_id: t.eventId,
    name: t.name,
    description: t.description,
    category: t.category,
    assignee: t.assignee,
    priority: t.priority,
    start_date: parseDateOnlyOrNull(t.startDate) || new Date().toISOString().split('T')[0],
    due_date: parseDateOnlyOrNull(t.dueDate) || new Date().toISOString().split('T')[0],
    status: t.status,
    dependency: t.dependency,
    notes: t.notes,
  }));
  const { error: errTasks } = await supabase.from('tasks').upsert(tasksData);
  if (errTasks) console.error('Error seeding tasks:', errTasks);

  // 8. Budget Items
  console.log('Seeding Budget Items:', SEED_BUDGET_ITEMS.length);
  const validVendorIds = new Set(SEED_VENDORS.map((v) => v.id));
  const budgetData = SEED_BUDGET_ITEMS.filter((b) => validEventIds.has(b.eventId)).map((b) => ({
    id: b.id,
    event_id: b.eventId,
    category: b.category,
    category_label: b.categoryLabel,
    subcategory: b.subcategory,
    description: b.description,
    vendor_id: b.vendorId && validVendorIds.has(b.vendorId) ? b.vendorId : null,
    vendor_name: b.vendorName,
    quantity: b.quantity || 1,
    unit: b.unit || 'Paket',
    estimated_unit_cost: b.estimatedUnitCost || 0,
    estimated_total: b.estimatedTotal || 0,
    actual_unit_cost: b.actualUnitCost || 0,
    actual_total: b.actualTotal || 0,
    tax_rate: b.taxRate || 0,
    tax_amount: b.taxAmount || 0,
    discount: b.discount || 0,
    currency: b.currency || 'IDR',
    payment_status: b.paymentStatus || 'Pending',
    approval_status: b.approvalStatus || 'APPROVED',
    status: b.status || 'Approved',
    due_date: parseDateOnlyOrNull(b.dueDate),
    notes: b.notes,
    paid_amount: b.paidAmount || 0,
  }));
  const { error: errBudget } = await supabase.from('budget_items').upsert(budgetData);
  if (errBudget) console.error('Error seeding budget items:', errBudget);

  // 9. Purchase Orders
  console.log('Seeding Purchase Orders:', SEED_PURCHASE_ORDERS.length);
  const poData = SEED_PURCHASE_ORDERS.filter((p) => validEventIds.has(p.eventId)).map((p) => ({
    id: p.id,
    po_number: p.poNumber,
    event_id: p.eventId,
    vendor_id: p.vendorId || null,
    vendor_name: p.vendorName,
    date: parseDateOnlyOrNull(p.date) || new Date().toISOString().split('T')[0],
    delivery_date: parseDateOnlyOrNull(p.deliveryDate),
    issued_by: p.issuedBy,
    expected_delivery: p.expectedDelivery,
    payment_terms: p.paymentTerms,
    subtotal: p.subtotal || 0,
    tax: p.tax || 0,
    discount: p.discount || 0,
    total: p.total || 0,
    paid_amount: p.paidAmount || 0,
    status: p.status || 'Approved',
    items: p.items || [],
    approval_required: p.approvalRequired || false,
    approved_by: p.approvedBy,
    approved_at: parseDateOrNull(p.approvedAt),
  }));
  const { error: errPO } = await supabase.from('purchase_orders').upsert(poData);
  if (errPO) console.error('Error seeding purchase orders:', errPO);

  // 10. Revenues
  console.log('Seeding Revenues:', SEED_REVENUES.length);
  const revenuesData = SEED_REVENUES.filter((r) => validEventIds.has(r.eventId)).map((r) => ({
    id: r.id,
    event_id: r.eventId,
    category: r.category,
    description: r.description,
    target_revenue: r.targetRevenue || r.estimatedRevenue || 0,
    estimated_revenue: r.estimatedRevenue || 0,
    actual_revenue: r.actualRevenue || 0,
    received: r.received || 0,
    due_date: parseDateOnlyOrNull(r.dueDate),
    payment_status: r.paymentStatus || 'PARTIALLY_PAID',
    status: r.status || 'Partial',
    payer_name: r.payerName,
    notes: r.notes,
  }));
  const { error: errRev } = await supabase.from('revenues').upsert(revenuesData);
  if (errRev) console.error('Error seeding revenues:', errRev);

  // 11. Crew
  console.log('Seeding Crew:', SEED_CREW.length);
  const crewData = SEED_CREW.filter((c) => validEventIds.has(c.eventId)).map((c) => ({
    id: c.id,
    event_id: c.eventId,
    name: c.name,
    role: c.role,
    department: c.department,
    phone: c.phone || c.contact,
    contact: c.contact,
    call_time: c.callTime,
    work_time: c.workTime,
    daily_rate: c.dailyRate || c.rate || 0,
    days_count: c.daysCount || 1,
    total_fee: c.totalFee || 0,
    overtime: c.overtime || 0,
    payment_status: c.paymentStatus || 'SCHEDULED',
    notes: c.notes,
  }));
  const { error: errCrew } = await supabase.from('crew_assignments').upsert(crewData);
  if (errCrew) console.error('Error seeding crew:', errCrew);

  // 12. Rundown
  console.log('Seeding Rundown:', SEED_RUNDOWN.length);
  const rundownData = SEED_RUNDOWN.filter((r) => validEventIds.has(r.eventId)).map((r) => ({
    id: r.id,
    event_id: r.eventId,
    day_number: r.dayNumber || 1,
    date: parseDateOnlyOrNull(r.date),
    time: r.time,
    duration: r.duration || 30,
    segment: r.segment,
    description: r.description,
    talent: r.talent,
    venue_area: r.venueArea,
    pic: r.pic,
    technical_cue: r.technicalCue,
    audio_cue: r.audioCue,
    lighting_cue: r.lightingCue,
    video_cue: r.videoCue,
    special_effect: r.specialEffect,
    notes: r.notes,
    sort_order: r.order || 0,
  }));
  const { error: errRundown } = await supabase.from('rundown_items').upsert(rundownData);
  if (errRundown) console.error('Error seeding rundown:', errRundown);

  // 13. Risks
  console.log('Seeding Risks:', SEED_RISKS.length);
  const risksData = SEED_RISKS.filter((rk) => validEventIds.has(rk.eventId)).map((rk) => ({
    id: rk.id,
    event_id: rk.eventId,
    category: rk.category,
    risk_description: rk.description,
    probability: rk.probability,
    impact: rk.impact,
    severity: rk.severity || 'MEDIUM',
    mitigation_plan: rk.mitigation,
    contingency_plan: rk.contingency,
    pic: (rk as any).pic || 'Safety Officer',
    status: rk.status || 'ACTIVE',
  }));
  const { error: errRisks } = await supabase.from('risk_items').upsert(risksData);
  if (errRisks) console.error('Error seeding risks:', errRisks);

  // 14. Documents
  console.log('Seeding Documents:', SEED_DOCUMENTS.length);
  const documentsData = SEED_DOCUMENTS.filter((d) => validEventIds.has(d.eventId)).map((d) => ({
    id: d.id,
    event_id: d.eventId,
    name: d.name,
    category: d.category,
    uploaded_by: d.uploadedBy,
    file_size: d.fileSize,
    file_type: d.fileType,
    file_url: d.fileUrl,
    status: d.status || 'Final',
    notes: d.notes,
  }));
  const { error: errDocs } = await supabase.from('document_items').upsert(documentsData);
  if (errDocs) console.error('Error seeding documents:', errDocs);

  // 15. Payments
  console.log('Seeding Payments:', SEED_PAYMENTS.length);
  const paymentsData = SEED_PAYMENTS.filter((p) => !p.eventId || validEventIds.has(p.eventId)).map((p) => ({
    id: p.id,
    event_id: p.eventId || null,
    event_name: p.eventName,
    payee: p.payee,
    type: p.type,
    reference: p.reference,
    category: p.category,
    amount: p.amount,
    due_date: parseDateOnlyOrNull(p.dueDate),
    payment_date: parseDateOnlyOrNull(p.paymentDate),
    payment_method: p.paymentMethod || 'Bank Transfer',
    status: p.status || 'SCHEDULED',
    bank_details: p.bankDetails || {},
    notes: p.notes,
  }));
  const { error: errPayments } = await supabase.from('payment_records').upsert(paymentsData);
  if (errPayments) console.error('Error seeding payments:', errPayments);

  console.log('--- ALL SEED DATA SUCCESSFULLY MIGRATED TO SUPABASE ---');
}

runSeed().catch((err) => {
  console.error('Fatal error during seed migration:', err);
  process.exit(1);
});
