export type UUID = string;

export type EventStatus =
  | 'DRAFT'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CONFIRMED'
  | 'PRE_PRODUCTION'
  | 'PRODUCTION'
  | 'LIVE'
  | 'COMPLETED'
  | 'SETTLEMENT'
  | 'CANCELLED'
  | 'ARCHIVED';

export type EventType =
  | 'Concert'
  | 'Festival'
  | 'University Festival'
  | 'Corporate Event'
  | 'Government Event'
  | 'Wedding'
  | 'Exhibition'
  | 'Conference'
  | 'Seminar'
  | 'Product Launch'
  | 'Brand Activation'
  | 'Private Event'
  | 'Music Festival'
  | 'Sports Event'
  | 'Hybrid Event'
  | 'Live Streaming Event'
  | 'Broadcast Event';

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT' | (string & {});
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | (string & {});

export interface EventPICs {
  projectManager: string;
  eventPIC: string;
  financePIC: string;
  productionPIC: string;
  technicalPIC: string;
  creativePIC: string;
  salesPIC: string;
  safetyOfficer?: string;
  logisticsPIC?: string;
  artistPIC?: string;
  [key: string]: string | undefined;
}

export interface Event {
  id: UUID;
  code: string;
  name: string;
  type: EventType;
  clientId: UUID;
  clientName: string;
  clientContact: string;
  description: string;
  objective: string;
  theme: string;
  venueId: UUID;
  venueName: string;
  venueAddress: string;
  city: string;
  province: string;
  country: string;
  startDate: string;
  endDate: string;
  loadInDate: string;
  setupDate: string;
  technicalRehearsalDate: string;
  generalRehearsalDate: string;
  eventDayDate: string;
  strikeDate: string;
  loadOutDate: string;
  expectedAttendance: number;
  actualAttendance: number;
  status: EventStatus;
  priority: EventPriority;
  pics: EventPICs;
  totalBudget: number;
  estimatedCost: number;
  actualCost: number;
  committedCost: number;
  totalRevenue: number;
  actualRevenue: number;
  receivedRevenue: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  milestones?: ProductionMilestone[];
  customMilestones?: ProductionMilestone[];
}

export interface MilestoneTag {
  id: string;
  label: string;
  color: string;
  isDefault?: boolean;
}

export interface ProductionMilestone {
  id: string;
  date: string;       // YYYY-MM-DD
  time?: string;      // HH:mm (e.g. "08:00")
  title?: string;     // Agenda detail / "ngapain" (fallback to name if empty)
  tagId?: string;     // Relasi ke tag label
  tagLabel?: string;  // Nama label ("Show Day", "Load-In", dsb)
  tagColor?: string;  // Kode warna badge ("rose", "sky", dsb)
  notes?: string;
  // Field kompatibilitas backward
  name?: string;
  category?: 'LOAD_IN' | 'SETUP' | 'REHEARSAL' | 'SHOW_DAY' | 'STRIKE' | 'LOAD_OUT' | 'CUSTOM' | string;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'DELAYED';
  pic?: string;
}

export type BudgetCategoryType =
  | 'ARTIST_TALENT'
  | 'VENUE'
  | 'PRODUCTION'
  | 'CREATIVE'
  | 'MARKETING'
  | 'OPERATIONS'
  | 'ADMINISTRATION'
  | 'CONTINGENCY'
  | 'CUSTOM'
  | 'Production & Staging'
  | 'Sound, Lighting & LED'
  | 'Talent & Artist Fee'
  | 'Venue & Permits'
  | 'Operations & Logistics'
  | 'Crew & Honorarium'
  | 'Marketing & Media'
  | 'Hospitality & Catering'
  | 'Contingency & Misc'
  | (string & {});

export type BudgetCategory = BudgetCategoryType;

export type PaymentStatus =
  | 'SCHEDULED'
  | 'PENDING'
  | 'APPROVED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'Pending'
  | 'Paid'
  | 'Overdue'
  | 'Scheduled'
  | 'Partially Paid'
  | 'Cancelled'
  | (string & {});

export type ApprovalStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUIRED';

export interface BudgetItem {
  id: UUID;
  eventId: UUID;
  category: BudgetCategoryType;
  categoryLabel?: string;
  subcategory?: string;
  description: string;
  vendorId?: UUID;
  vendorName?: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedTotal: number;
  actualUnitCost: number;
  actualTotal: number;
  variance: number; // estimatedTotal - actualTotal
  taxRate?: number; // e.g. 11% PPN
  taxAmount?: number;
  discount?: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  approvalStatus?: ApprovalStatus;
  status?: string;
  dueDate?: string;
  notes?: string;
  paidAmount?: number;
}

export type ArtistType =
  | 'Headliner'
  | 'Supporting Artist'
  | 'Band'
  | 'DJ'
  | 'MC'
  | 'Speaker'
  | 'Influencer'
  | 'Guest'
  | 'Other';

export type ArtistBookingStatus =
  | 'Inquiry'
  | 'Negotiation'
  | 'Tentative'
  | 'Hold'
  | 'Offered'
  | 'Confirmed'
  | 'Contracted'
  | 'Completed'
  | 'Cancelled';

export type BookingStatus = ArtistBookingStatus;
export type RiderStatus = 'Pending' | 'Approved' | 'Rejected' | 'Negotiating';

export interface TechnicalRider {
  stageRequirement: string;
  audioRequirement: string;
  monitorSystem: string;
  backlineList: string[];
  microphoneSpec: string[];
  lightingMood: string;
  videoVisualSpec: string;
  powerRequirement: string;
  stagePlotAttached: boolean;
  inputListAttached: boolean;
  notes: string;
}

export interface HospitalityRider {
  dressingRooms: string;
  foodAndBeverage: string[];
  hotelRequirement: string;
  transportation: string;
  securityDetail: string;
  guestListQuota: number;
  specialRequests: string[];
}

export type ContractStatus =
  | 'Draft'
  | 'Drafted'
  | 'Sent'
  | 'Negotiation'
  | 'Signed'
  | 'Active'
  | 'Completed'
  | 'Cancelled';

export interface ContractMilestone {
  name: string; // 'Deposit', 'First Payment', 'Second Payment', 'Final Payment'
  percentage: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
}

export interface ArtistContract {
  id: UUID;
  artistId: UUID;
  eventId: UUID;
  contractNumber: string;
  contractDate: string;
  contractStart: string;
  contractEnd: string;
  fee: number;
  tax: number;
  totalContractValue: number;
  deposit: number;
  remainingPayment: number;
  paymentTerms: string;
  cancellationTerms: string;
  status: ContractStatus;
  contractDocumentName?: string;
  milestones: ContractMilestone[];
  notes: string;
}

export interface Artist {
  id: UUID;
  eventId: UUID;
  name: string;
  type: ArtistType;
  agency: string;
  management?: string;
  contactPerson: string;
  phone: string;
  email: string;
  genre: string;
  country?: string;
  city?: string;
  currency?: string;
  performanceDuration?: number; // in minutes
  performanceDurationMinutes?: number;
  entourageCount?: number;
  contractUrl?: string;
  setTime?: string;
  arrivalTime?: string;
  departureTime?: string;
  fee: number;
  tax?: number;
  transportAllowance?: number;
  accommodationDetail?: string;
  bookingStatus: ArtistBookingStatus;
  paymentStatus?: PaymentStatus;
  contractStatus: ContractStatus;
  technicalRider: any;
  hospitalityRider: any;
  contract?: ArtistContract;
  paymentMilestones?: any[];
  notes?: string;
}

export type RiderGearStatus = 'PENDING_REVIEW' | 'CONFIRMED_INTERNAL' | 'CONFIRMED_VENDOR';

export interface ArtistRiderGearItem {
  id: string;
  name: string;
  isFromErp: boolean;
  itemId?: string;
  itemSku?: string;
  category?: string;
  status: RiderGearStatus;
  vendorId?: string;
  vendorName?: string;
  notes?: string;
  quantity?: number;
  allocatedDate?: string;
  placementArea?: string;
}

export type VendorCategory =
  | 'Venue'
  | 'Production'
  | 'Sound'
  | 'Lighting'
  | 'LED'
  | 'Stage'
  | 'Rigging'
  | 'Generator'
  | 'Catering'
  | 'Transportation'
  | 'Security'
  | 'Medical'
  | 'Accommodation'
  | 'Printing'
  | 'Creative'
  | 'Documentation'
  | 'Broadcast'
  | 'Streaming'
  | 'Artist Management'
  | 'Other';

export interface Vendor {
  id: UUID;
  name: string;
  company: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  npwp: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  rating: number; // 1-5
  notes: string;
  activeEventsCount: number;
}

export type QuotationStatus =
  | 'Draft'
  | 'Requested'
  | 'Received'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Converted to PO'
  | 'Cancelled';

export interface VendorQuotation {
  id: UUID;
  quotationNumber: string;
  vendorId: UUID;
  vendorName: string;
  eventId: UUID;
  date: string;
  validUntil: string;
  description: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms: string;
  attachmentName?: string;
  status: QuotationStatus;
  items: {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
}

export type POStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent'
  | 'Issued'
  | 'Accepted'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | (string & {});

export interface PurchaseOrder {
  id: UUID;
  poNumber: string;
  eventId: UUID;
  vendorId: UUID;
  vendorName: string;
  date?: string;
  deliveryDate?: string;
  issuedBy?: string;
  expectedDelivery?: string;
  paymentTerms?: string;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paidAmount?: number;
  status: POStatus;
  items: {
    id?: UUID;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total?: number;
    totalPrice?: number;
  }[];
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export type RevenueCategory =
  | 'Client Project Fee'
  | 'Sponsorship'
  | 'Ticket Sales'
  | 'Booth Rental'
  | 'Merchandising'
  | 'Partnership'
  | 'F&B Revenue'
  | 'Advertising'
  | 'Other'
  | 'Tenant & Booth Rental'
  | 'Merchandise Sales'
  | 'Broadcasting Rights'
  | 'F&B Share'
  | 'Government Subsidy'
  | 'Other Revenue'
  | (string & {});

export interface RevenueItem {
  id: UUID;
  eventId: UUID;
  category: RevenueCategory;
  description: string;
  targetRevenue?: number;
  estimatedRevenue?: number;
  actualRevenue: number;
  received: number;
  outstanding: number;
  dueDate?: string;
  paymentStatus?: PaymentStatus;
  status?: 'Received' | 'Partial' | 'Pending' | 'Overdue' | (string & {});
  payerName?: string;
  notes?: string;
}

export type SponsorshipType = 'CASH' | 'IN_KIND';

export type SponsorshipGroup =
  | 'Kelompok Sponsor Utama & Tingkatan (Tiered Sponsorship)'
  | 'Kelompok Mitra Strategis (Partnership)'
  | 'Skema Alternatif / Eksklusif'
  | (string & {});

export type SponsorshipTier =
  | 'Sponsor Utama (Title/Platinum Sponsor)'
  | 'Sponsor Madya (Gold Sponsor)'
  | 'Sponsor Pendamping (Silver Sponsor)'
  | 'Sponsor Pendukung (Bronze Sponsor)'
  | 'Media Partner'
  | 'Official Venue Partner'
  | 'Official Food & Beverage Partner'
  | 'Logistics & Transport Partner'
  | 'Ticketing Partner'
  | 'Apparel/Merchandise Partner'
  | 'Community Partner'
  | 'Sponsor Eksklusif (Exclusive Sponsor)'
  | (string & {});

export type SponsorshipStatus =
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Confirmed'
  | 'Contract Signed'
  | 'In Progress'
  | 'Completed'
  | 'Declined'
  | (string & {});

export interface SponsorshipItem {
  id: UUID;
  eventId?: UUID | null;
  sponsorName: string;
  brandName?: string;
  type: SponsorshipType;
  group: SponsorshipGroup | string;
  tier: SponsorshipTier;
  contributionValue: number;
  receivedValue?: number;
  paymentStatus?: PaymentStatus;
  status: SponsorshipStatus;
  contactPerson: string;
  phone: string;
  email: string;
  deliverables?: string;
  inKindDetails?: string;
  contractNumber?: string;
  contractDate?: string;
  logoUrl?: string;
  notes?: string;
}

export interface Client {
  id: UUID;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  taxInformation: string;
  notes: string;
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalRevenue: number;
  outstandingReceivable: number;
}

export type CrewRole =
  | 'Event Director'
  | 'Project Manager'
  | 'Production Manager'
  | 'Stage Manager'
  | 'Show Caller'
  | 'Technical Director'
  | 'Audio Engineer'
  | 'Lighting Director'
  | 'Video Director'
  | 'Camera Operator'
  | 'Broadcast Engineer'
  | 'Streaming Engineer'
  | 'Runner'
  | 'Security'
  | 'Medical'
  | 'FOH'
  | 'Backstage'
  | 'Hospitality'
  | 'Other';

export interface CrewAssignment {
  id: UUID;
  eventId: UUID;
  name: string;
  role: CrewRole | string;
  department?: string;
  phone?: string;
  contact?: string;
  callTime: string;
  workTime?: string;
  rate?: number;
  dailyRate?: number;
  daysCount?: number;
  totalFee?: number;
  overtime?: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export type TaskStatus =
  | 'Backlog'
  | 'To Do'
  | 'In Progress'
  | 'Blocked'
  | 'Review'
  | 'Completed'
  | 'Cancelled';

export interface Task {
  id: UUID;
  eventId: UUID;
  name: string;
  description?: string;
  category: string;
  assignee: string;
  priority: EventPriority;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  dependency?: string;
  notes?: string;
}

export interface Milestone {
  id: UUID;
  eventId: UUID;
  name: string;
  date: string;
  phase: string;
  completed: boolean;
  order: number;
}

export interface RundownItem {
  id: UUID;
  eventId: UUID;
  dayNumber?: number; // 1, 2, 3...
  date?: string; // YYYY-MM-DD
  time: string;
  duration: number; // in minutes
  segment: string;
  description: string;
  talent: string;
  venueArea: string;
  pic: string;
  technicalCue: string;
  audioCue: string;
  lightingCue: string;
  videoCue: string;
  specialEffect: string;
  notes: string;
  order: number;
}

export interface Venue {
  id: UUID;
  name: string;
  address: string;
  city: string;
  capacity: number;
  type: 'Indoor' | 'Outdoor' | 'Hybrid';
  contactPerson: string;
  contactPhone: string;
  rentalCost: number;
  parkingCapacity: string;
  loadingAreaSpecs: string;
  powerCapacity: string; // e.g. "250 kVA + GenSet Backup"
  restrictions: string;
  curfewTime: string;
  notes: string;
}

export interface DocumentItem {
  id: UUID;
  eventId: UUID;
  name: string;
  category:
    | 'Contract'
    | 'Proposal'
    | 'Quotation'
    | 'PO'
    | 'Invoice'
    | 'Artist Rider'
    | 'Technical Rider'
    | 'Venue Agreement'
    | 'Permit'
    | 'Insurance'
    | 'Rundown'
    | 'Production Book'
    | 'Post Event Report'
    | 'Contract & Agreement'
    | 'Permits & Licensing'
    | 'Technical Rider & Stage Plot'
    | 'Floor Plan & CAD Layout'
    | 'Insurance & Safety'
    | 'Invoice & Tax Faktur'
    | 'Marketing Collateral'
    | 'Post-Event Report'
    | (string & {});
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  status: 'Draft' | 'Final' | 'Approved' | 'Archived' | 'Verified' | 'Pending' | (string & {});
  notes?: string;
}

export type RiskCategory =
  | 'Financial'
  | 'Technical'
  | 'Artist'
  | 'Venue'
  | 'Weather'
  | 'Security'
  | 'Safety'
  | 'Legal'
  | 'Operational'
  | 'Transportation'
  | 'Crowd'
  | 'Vendor'
  | 'Crowd Safety'
  | 'Weather & Force Majeure'
  | 'Permits & Regulatory'
  | 'Power & Technical'
  | 'Talent & Artist'
  | 'Financial & Commercial'
  | 'Medical & Health'
  | 'Security & Conflict'
  | (string & {});

export interface RiskItem {
  id: UUID;
  eventId: UUID;
  description: string;
  category: RiskCategory;
  probability: number; // 1-5
  impact: number; // 1-5
  severity: number; // probability * impact (1-25)
  score?: number;
  owner: string;
  mitigation: string;
  contingency: string;
  status: 'Open' | 'Mitigated' | 'Closed' | 'Occurred' | 'Identified' | (string & {});
}

export interface ApprovalRequest {
  id: UUID;
  eventId: UUID;
  eventName: string;
  type: 'BUDGET_OVERRUN' | 'ARTIST_BOOKING' | 'PURCHASE_ORDER' | 'VENDOR_CONTRACT' | 'PAYMENT';
  requester: string;
  approver: string;
  date: string;
  amount: number;
  reason: string;
  status: ApprovalStatus;
  comment?: string;
  entityId: UUID;
}

export interface PaymentRecord {
  id: UUID;
  eventId: UUID;
  eventName: string;
  payee: string;
  type: 'VENDOR' | 'ARTIST' | 'VENUE' | 'CREW' | 'PERMIT' | 'TAX' | 'OTHER';
  category?: string;
  reference: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'Corporate Card' | 'Cheque' | 'Cash';
  status: PaymentStatus;
  notes: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface TaxConfiguration {
  id: UUID;
  name: string;
  taxType: 'PPN' | 'PPH_21' | 'PPH_23' | 'ENTERTAINMENT_TAX' | 'CUSTOM';
  rate: number; // percentage, e.g. 11 for 11%
  description: string;
  withholding: boolean;
}

export type NotificationCategory =
  | 'BUDGET'
  | 'PAYMENT'
  | 'LOGISTICS'
  | 'RISK'
  | 'TASK'
  | 'PROCUREMENT'
  | 'APPROVAL'
  | 'SYSTEM';

export interface NotificationAction {
  type: 'NAVIGATE';
  view?: string;
  eventId?: UUID;
  tab?: string;
  label: string;
}

export interface NotificationItem {
  id: UUID;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  category: NotificationCategory;
  eventId?: UUID;
  eventName?: string;
  createdAt: string;
  read: boolean;
  link?: string;
  action?: NotificationAction;
}

export interface AuditLogItem {
  id: UUID;
  userId: UUID;
  userName: string;
  userRole: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'STATUS_CHANGE';
  entity: string;
  entityId: UUID;
  eventId?: UUID | null;
  eventName?: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
}

export interface UserAccount {
  id: UUID;
  name: string;
  email: string;
  role:
    | 'SUPER_ADMIN'
    | 'EVENT_DIRECTOR'
    | 'PROJECT_MANAGER'
    | 'PRODUCTION_MANAGER'
    | 'TECHNICAL_MANAGER'
    | 'FINANCE'
    | 'PROCUREMENT'
    | 'CREATIVE'
    | 'SALES'
    | 'VIEWER';
  avatar: string;
  department: string;
  permissions: string[];
}

export interface EventChecklistItem {
  id: UUID;
  eventId: UUID;
  title: string;
  category: string;
  completed: boolean;
  assignedRole: string;
  dueDate: string;
}

export interface EventTemplate {
  id: UUID;
  name: string;
  eventType: EventType;
  description: string;
  estimatedDurationDays: number;
  defaultChecklist: string[];
  defaultMilestones: string[];
  defaultCategories: string[];
  defaultRoles: string[];
}

// FUTURE INTEGRATION ABSTRACTION: ERP LOGISTICS
export type RequirementStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'RESERVED'
  | 'ALLOCATED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export interface EventRequirement {
  id: UUID;
  eventId: UUID;
  externalSystem?: 'ERP_LOGISTICS' | string;
  externalReference?: string; // ID inside ERP Logistik once synchronized
  itemReference: string; // e.g. "L-Acoustics K2 Line Array Speaker", "Digico SD7"
  category: 'SOUND' | 'LIGHTING' | 'LED_VIDEO' | 'STAGE_RIGGING' | 'POWER_GENSET' | 'BACKLINE' | (string & {});
  description?: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  returnDate: string;
  status: RequirementStatus;
  notes?: string;
  reservedAt?: string;
  deliveredAt?: string;
  warehouseAssigned?: string;
  sku?: string;
  imageUrl?: string;
  placementArea?: string;
  allocatedQuantity?: number;
  sourceItemId?: string;
  artistName?: string;
  isRiderFulfilled?: boolean;
}

export type PaymentApprovalStatus =
  | 'PENDING_PM'
  | 'PENDING_FINANCE'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED';

export interface PaymentRequest {
  id: string;
  voucherNumber: string;
  eventId: string;
  beneficiaryName: string;
  category:
    | 'Vendor'
    | 'Artist Fee'
    | 'Venue'
    | 'Permits & Legal'
    | 'Crew Honorarium'
    | 'Production Operational';
  amount: number;
  dueDate: string;
  description: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: PaymentApprovalStatus;
  submittedBy: string;
  approvedBy?: string;
  notes?: string;
}
