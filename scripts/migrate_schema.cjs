const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Load DATABASE_URL
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
envContent.split('\n').forEach((l) => {
  const line = l.trim();
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
});

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

const schemaSql = `
-- Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CLIENTS (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('cli_' || replace(gen_random_uuid()::text, '-', '')),
    company VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(100),
    address TEXT,
    industry VARCHAR(150) DEFAULT 'Corporate',
    tax_information VARCHAR(100),
    notes TEXT,
    total_events INT DEFAULT 0,
    active_events INT DEFAULT 0,
    completed_events INT DEFAULT 0,
    total_revenue NUMERIC(15, 2) DEFAULT 0,
    outstanding_receivable NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients (company);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients (created_at DESC);

-- 2. VENUES
CREATE TABLE IF NOT EXISTS public.venues (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('ven_' || replace(gen_random_uuid()::text, '-', '')),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 0,
    type VARCHAR(50) DEFAULT 'Outdoor',
    contact_person VARCHAR(255),
    contact_phone VARCHAR(100),
    rental_cost NUMERIC(15, 2) DEFAULT 0,
    parking_capacity VARCHAR(150),
    loading_area_specs TEXT,
    power_capacity VARCHAR(150),
    restrictions TEXT,
    curfew_time VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues (city);
CREATE INDEX IF NOT EXISTS idx_venues_name ON public.venues (name);
CREATE INDEX IF NOT EXISTS idx_venues_created_at ON public.venues (created_at DESC);

-- 3. VENDORS
CREATE TABLE IF NOT EXISTS public.vendors (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('vnd_' || replace(gen_random_uuid()::text, '-', '')),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    npwp VARCHAR(100),
    bank_name VARCHAR(100) DEFAULT 'BCA',
    bank_account_number VARCHAR(100),
    bank_account_holder VARCHAR(255),
    rating NUMERIC(3, 1) DEFAULT 5.0,
    notes TEXT,
    active_events_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors (category);
CREATE INDEX IF NOT EXISTS idx_vendors_company ON public.vendors (company);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON public.vendors (created_at DESC);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('evt_' || replace(gen_random_uuid()::text, '-', '')),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    client_id VARCHAR(100) REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    client_contact VARCHAR(255),
    description TEXT,
    objective TEXT,
    theme VARCHAR(255),
    venue_id VARCHAR(100) REFERENCES public.venues(id) ON DELETE SET NULL,
    venue_name VARCHAR(255),
    venue_address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    load_in_date TIMESTAMPTZ,
    setup_date TIMESTAMPTZ,
    technical_rehearsal_date TIMESTAMPTZ,
    general_rehearsal_date TIMESTAMPTZ,
    event_day_date TIMESTAMPTZ,
    strike_date TIMESTAMPTZ,
    load_out_date TIMESTAMPTZ,
    expected_attendance INT DEFAULT 0,
    actual_attendance INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'CONFIRMED' NOT NULL,
    priority VARCHAR(50) DEFAULT 'HIGH' NOT NULL,
    pics JSONB DEFAULT '{}'::jsonb,
    total_budget NUMERIC(15, 2) DEFAULT 0,
    estimated_cost NUMERIC(15, 2) DEFAULT 0,
    actual_cost NUMERIC(15, 2) DEFAULT 0,
    committed_cost NUMERIC(15, 2) DEFAULT 0,
    total_revenue NUMERIC(15, 2) DEFAULT 0,
    actual_revenue NUMERIC(15, 2) DEFAULT 0,
    received_revenue NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'IDR',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON public.events (client_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON public.events (venue_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events (created_at DESC);

-- 5. SPONSORSHIPS
CREATE TABLE IF NOT EXISTS public.sponsorships (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('spn_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE,
    sponsor_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    type VARCHAR(20) DEFAULT 'CASH',
    group_name VARCHAR(255) NOT NULL,
    tier VARCHAR(150) NOT NULL,
    contribution_value NUMERIC(15, 2) DEFAULT 0,
    received_value NUMERIC(15, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'SCHEDULED',
    status VARCHAR(50) DEFAULT 'Contract Signed',
    contact_person VARCHAR(255),
    phone VARCHAR(100),
    email VARCHAR(255),
    deliverables TEXT,
    in_kind_details TEXT,
    contract_number VARCHAR(100),
    contract_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_event_id ON public.sponsorships (event_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_tier ON public.sponsorships (tier);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON public.sponsorships (status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_created_at ON public.sponsorships (created_at DESC);

-- 6. ARTISTS
CREATE TABLE IF NOT EXISTS public.artists (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('art_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'Headliner',
    agency VARCHAR(255),
    management VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(100),
    email VARCHAR(255),
    genre VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    city VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'IDR',
    performance_duration INT DEFAULT 60,
    entourage_count INT DEFAULT 1,
    contract_url TEXT,
    set_time VARCHAR(50),
    arrival_time VARCHAR(50),
    departure_time VARCHAR(50),
    fee NUMERIC(15, 2) DEFAULT 0,
    tax NUMERIC(15, 2) DEFAULT 0,
    transport_allowance NUMERIC(15, 2) DEFAULT 0,
    accommodation_detail TEXT,
    booking_status VARCHAR(50) DEFAULT 'Confirmed',
    payment_status VARCHAR(50) DEFAULT 'SCHEDULED',
    contract_status VARCHAR(50) DEFAULT 'Signed',
    technical_rider JSONB DEFAULT '{}'::jsonb,
    hospitality_rider JSONB DEFAULT '{}'::jsonb,
    contract JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artists_event_id ON public.artists (event_id);
CREATE INDEX IF NOT EXISTS idx_artists_name ON public.artists (name);
CREATE INDEX IF NOT EXISTS idx_artists_booking_status ON public.artists (booking_status);
CREATE INDEX IF NOT EXISTS idx_artists_created_at ON public.artists (created_at DESC);

-- 7. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('tsk_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    assignee VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'HIGH',
    start_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'To Do',
    dependency VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks (event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks (category);

-- 8. BUDGET ITEMS
CREATE TABLE IF NOT EXISTS public.budget_items (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('bgt_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(100) NOT NULL,
    category_label VARCHAR(150),
    subcategory VARCHAR(100),
    description TEXT NOT NULL,
    vendor_id VARCHAR(100) REFERENCES public.vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255),
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'Paket',
    estimated_unit_cost NUMERIC(15, 2) DEFAULT 0,
    estimated_total NUMERIC(15, 2) DEFAULT 0,
    actual_unit_cost NUMERIC(15, 2) DEFAULT 0,
    actual_total NUMERIC(15, 2) DEFAULT 0,
    variance NUMERIC(15, 2) GENERATED ALWAYS AS (estimated_total - actual_total) STORED,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'IDR',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    approval_status VARCHAR(50) DEFAULT 'APPROVED',
    status VARCHAR(50) DEFAULT 'Approved',
    due_date DATE,
    notes TEXT,
    paid_amount NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON public.budget_items (event_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON public.budget_items (category);
CREATE INDEX IF NOT EXISTS idx_budget_items_vendor_id ON public.budget_items (vendor_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_created_at ON public.budget_items (created_at DESC);

-- 9. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('po_' || replace(gen_random_uuid()::text, '-', '')),
    po_number VARCHAR(100) NOT NULL UNIQUE,
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    vendor_id VARCHAR(100) REFERENCES public.vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    issued_by VARCHAR(255),
    expected_delivery VARCHAR(100),
    payment_terms TEXT,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax NUMERIC(15, 2) DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    total NUMERIC(15, 2) DEFAULT 0,
    paid_amount NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Approved',
    items JSONB DEFAULT '[]'::jsonb,
    approval_required BOOLEAN DEFAULT false,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_po_event_id ON public.purchase_orders (event_id);
CREATE INDEX IF NOT EXISTS idx_po_vendor_id ON public.purchase_orders (vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON public.purchase_orders (status);
CREATE INDEX IF NOT EXISTS idx_po_created_at ON public.purchase_orders (created_at DESC);

-- 10. REVENUES
CREATE TABLE IF NOT EXISTS public.revenues (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('rev_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    target_revenue NUMERIC(15, 2) DEFAULT 0,
    estimated_revenue NUMERIC(15, 2) DEFAULT 0,
    actual_revenue NUMERIC(15, 2) DEFAULT 0,
    received NUMERIC(15, 2) DEFAULT 0,
    outstanding NUMERIC(15, 2) GENERATED ALWAYS AS (actual_revenue - received) STORED,
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'PARTIALLY_PAID',
    status VARCHAR(50) DEFAULT 'Partial',
    payer_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revenues_event_id ON public.revenues (event_id);
CREATE INDEX IF NOT EXISTS idx_revenues_category ON public.revenues (category);
CREATE INDEX IF NOT EXISTS idx_revenues_created_at ON public.revenues (created_at DESC);

-- 11. CREW ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.crew_assignments (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('crw_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(100),
    contact VARCHAR(100),
    call_time VARCHAR(50),
    work_time VARCHAR(100),
    daily_rate NUMERIC(15, 2) DEFAULT 0,
    days_count INT DEFAULT 1,
    total_fee NUMERIC(15, 2) DEFAULT 0,
    overtime NUMERIC(15, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crew_event_id ON public.crew_assignments (event_id);
CREATE INDEX IF NOT EXISTS idx_crew_created_at ON public.crew_assignments (created_at DESC);

-- 12. RUNDOWN ITEMS
CREATE TABLE IF NOT EXISTS public.rundown_items (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('rdn_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    day_number INT DEFAULT 1,
    date DATE,
    time VARCHAR(20) NOT NULL,
    duration INT DEFAULT 30,
    segment VARCHAR(255) NOT NULL,
    description TEXT,
    talent VARCHAR(255),
    venue_area VARCHAR(100),
    pic VARCHAR(255),
    technical_cue TEXT,
    audio_cue TEXT,
    lighting_cue TEXT,
    video_cue TEXT,
    special_effect TEXT,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rundowns_event_id ON public.rundown_items (event_id);
CREATE INDEX IF NOT EXISTS idx_rundowns_order ON public.rundown_items (event_id, sort_order ASC);

-- 13. RISK ITEMS
CREATE TABLE IF NOT EXISTS public.risk_items (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('rsk_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(100) NOT NULL,
    risk_description TEXT NOT NULL,
    probability INT CHECK (probability BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    severity VARCHAR(50) DEFAULT 'MEDIUM',
    mitigation_plan TEXT,
    contingency_plan TEXT,
    pic VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risks_event_id ON public.risk_items (event_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risk_items (status);

-- 14. DOCUMENT ITEMS
CREATE TABLE IF NOT EXISTS public.document_items (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('doc_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    file_size VARCHAR(50),
    file_type VARCHAR(50),
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'Final',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_event_id ON public.document_items (event_id);

-- 15. PAYMENT RECORDS
CREATE TABLE IF NOT EXISTS public.payment_records (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('pay_' || replace(gen_random_uuid()::text, '-', '')),
    event_id VARCHAR(100) REFERENCES public.events(id) ON DELETE CASCADE,
    event_name VARCHAR(255),
    payee VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    category VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE,
    payment_date DATE,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    bank_details JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_event_id ON public.payment_records (event_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payment_records (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payment_records (created_at DESC);

-- Trigger Function updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger dan RLS ke semua tabel
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'clients', 'venues', 'vendors', 'events', 'sponsorships',
        'artists', 'tasks', 'budget_items', 'purchase_orders',
        'revenues', 'crew_assignments', 'rundown_items',
        'risk_items', 'document_items', 'payment_records'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        ', tbl, tbl);

        -- Aktifkan RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

        -- Policy authenticated full access
        EXECUTE format('
            DROP POLICY IF EXISTS "Allow authenticated full access" ON public.%I;
            CREATE POLICY "Allow authenticated full access" ON public.%I
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
        ', tbl, tbl);

        -- Policy anon read/write for app client
        EXECUTE format('
            DROP POLICY IF EXISTS "Allow anon read/write for dev" ON public.%I;
            CREATE POLICY "Allow anon read/write for dev" ON public.%I
            FOR ALL TO anon USING (true) WITH CHECK (true);
        ', tbl, tbl);
    END LOOP;
END;
$$;
`;

async function run() {
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected! Executing schema DDL...');
    await client.query(schemaSql);
    console.log('SUCCESS: All 15 relational tables, indexes, triggers, and RLS created!');
    await client.end();
  } catch (err) {
    console.error('Error migrating schema:', err);
    process.exit(1);
  }
}

run();

