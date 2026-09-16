# 🎪 Event Management System (EMS)

<div align="center">

[![Next.js 15](https://img.shields.io/badge/Next.js-15.4.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-orange?style=for-the-badge)](#license)

**An enterprise-grade, full-lifecycle Event Management System built for concert promoters, festival organizers, production houses, and event management agencies.**

[ 🇬🇧 English Documentation ](#-english) &nbsp;&bull;&nbsp; [ 🇮🇩 Dokumentasi Bahasa Indonesia ](#-bahasa-indonesia)

</div>

---

## 📑 Table of Contents / Daftar Isi

- [🇬🇧 English](#-english)
  - [Overview](#-overview)
  - [Key Platform Features](#-key-platform-features)
  - [Architecture & Tech Stack](#-architecture--tech-stack)
  - [System Workflows](#-system-workflows)
  - [Module & Tab Breakdown](#-module--tab-breakdown)
  - [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
  - [Getting Started & Installation](#-getting-started--installation)
  - [Environment Variables](#-environment-variables)
  - [Project Structure](#-project-structure)
- [🇮🇩 Bahasa Indonesia](#-bahasa-indonesia)
  - [Ringkasan Proyek](#-ringkasan-proyek)
  - [Fitur Utama Sistem](#-fitur-utama-sistem)
  - [Arsitektur & Tumpukan Teknologi](#-arsitektur--tumpukan-teknologi)
  - [Alur Kerja Sistem (Workflow)](#-alur-kerja-sistem-workflow)
  - [Daftar Modul & Tab Event](#-daftar-modul--tab-event)
  - [Kontrol Akses Berbasis Peran (RBAC)](#-kontrol-akses-berbasis-peran-rbac)
  - [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
  - [Konfigurasi Lingkungan (.env)](#-konfigurasi-lingkungan-env)
  - [Struktur Folder](#-struktur-folder)

---

# 🇬🇧 English

## 🌟 Overview

**Event Management System (EMS)** is an all-in-one mission-control platform architected specifically for complex, high-stakes live productions—from mega-scale music festivals, arena concerts, and broadcast award shows, to high-profile corporate summits and government state events.

It bridges the traditional operational disconnect between **Executive Producers, Technical Directors, Finance Managers, Talent Liaisons, and Warehouse Logistics**, delivering complete visibility over multi-billion Rupiah budgets, cue-to-cue rundowns, contract disbursements, technical riders, and equipment allocation.

---

## ⚡ Key Platform Features

<details open>
<summary><b>1. 🎯 Portfolio & Global Dashboard</b></summary>

- **Multi-Event Health Scorecard**: Real-time aggregate telemetry (`HEALTHY`, `WARNING`, `CRITICAL`) factoring financial variances, impending deadlines, unmitigated risks, and pending approval queues.
- **Enterprise Financial Aggregates**: Instant rollup of total committed budget, actual spend, variance rate, collected revenue, and net profit margins across active events.
- **Global Search (`Ctrl+K` / `Cmd+K`)**: Rapid spotlight lookup traversing events, artists, crew rosters, purchase orders, vendor catalogs, and active checklists.
</details>

<details>
<summary><b>2. ⏱️ Production Timeline & Milestone Engine</b></summary>

- **7-Phase Milestone Pipeline**: Dedicated dates and operational cues for `Load-In`, `Setup`, `Technical Rehearsal`, `General Rehearsal`, `Show Day`, `Strike`, and `Load-Out`.
- **Dynamic Milestone Tagging**: Color-coded badges (`rose`, `sky`, `amber`, `emerald`, `indigo`, etc.) with customizable tag labels and date-time agenda items.
- **Milestone Gantt & Unified Master Calendar**: Interactive visual schedule across days and weeks to prevent venue loading conflicts and crew overbooking.
</details>

<details>
<summary><b>3. 💰 Budgeting & Variance Engineering</b></summary>

- **Multi-Tier Hierarchical Budgeting**: Categorized across *Sound & Lighting, Staging & Rigging, Talent & Artist Fees, Venue & Permits, Operations & Logistics, Crew Honorariums, Marketing, and Contingency*.
- **Planned vs. Committed vs. Actual Variance**: Automatic calculation of financial variances with visual warning badges when actual spend exceeds initial estimates.
- **Tax & Fee Configuration**: Native support for Indonesian taxation standards (PPN 11%, PPh 21, PPh 23, and Entertainment Tax) with discount and gross-up calculations.
</details>

<details>
<summary><b>4. 🎤 Artists & Rider Management System</b></summary>

- **Comprehensive Artist CRM**: Track booking statuses from `Inquiry` & `Negotiation` to `Confirmed` and `Contracted`.
- **Dual Rider Specifications**:
  - **Technical Rider**: Stage plot attachments, microphone input list, monitor systems, FOH specs, backline gear, and lighting moods.
  - **Hospitality Rider**: Green room dressing specifications, special dietary requirements, flight schedules, security details, and VIP guestlist allocations.
- **Rider-to-Logistics Sync**: Instant one-click gear matching between artist rider items and internal warehouse inventory or vendor sub-rentals.
</details>

<details>
<summary><b>5. 📦 ERP Logistics Hub Readiness</b></summary>

- **Internal Inventory Allocation**: Integrated inventory picker modal allowing production staff to reserve audio, lighting, video LED, generator, and staging assets.
- **Vendor Sub-Rental Handoff**: Seamlessly route items that are out-of-stock internally to external vendors as purchase orders.
- **Full Lifecycle State Machine**: Tracks equipment status through `DRAFT` ➔ `REQUESTED` ➔ `RESERVED` ➔ `ALLOCATED` ➔ `DELIVERED` ➔ `RETURNED`.
</details>

<details>
<summary><b>6. 🎬 Real-time Run-of-Show & Technical Cues</b></summary>

- **Cue-to-Cue Rundown Table**: Minute-by-minute rundown matrix tracking segment timings, talent on stage, and stage caller instructions.
- **Multi-Department Cues**: Explicit, separate cue fields for **Audio, Lighting, Video/LED playback, SFX/Pyrotechnics**, and zone area PICs.
- **Multi-Day Support**: Seamlessly organize multi-day festivals with separate day-numbering (`Day 1`, `Day 2`, etc.).
</details>

<details>
<summary><b>7. 🛡️ Risk Management Matrix</b></summary>

- **5x5 Qualitative Matrix**: Mathematical severity calculation (`Probability × Impact = Severity Score 1–25`) categorized into Low, Medium, High, and Critical risk tiers.
- **Mitigation & Contingency Protocols**: Structured registries defining concrete prevention actions, contingency triggers, and responsible risk owners.
</details>

<details>
<summary><b>8. 📜 Procurement & Purchase Orders (PO)</b></summary>

- **Vendor CRM & Performance Rating**: Detailed profiles including company NPWP, bank details, vendor categories, and historical reliability ratings (1–5 stars).
- **Quotations to PO Conversion**: Compare vendor quotations with subtotal, tax, and discount breakdowns, auto-converting approved quotes into trackable Purchase Orders.
</details>

<details>
<summary><b>9. 💳 Payment Requests & Two-Step Approval Workflow</b></summary>

- **Two-Step Approval Gate**: Ensures strict governance where disbursement vouchers require Project Manager endorsement followed by Finance Director sign-off (`PENDING_PM` ➔ `PENDING_FINANCE` ➔ `APPROVED` ➔ `DISBURSED`).
- **Beneficiary & Bank Routing**: Complete bank account details, voucher numbering (`VCH-101`), and due-date tracking.
</details>

<details>
<summary><b>10. 🤝 Sponsorship & Commercial Packages</b></summary>

- **Tiered Sponsorship Schemes**: Pre-configured tiers for *Title / Platinum Sponsor, Gold Sponsor, Silver Sponsor, Bronze Sponsor, and Exclusive Partners*.
- **Cash vs. In-Kind Contribution**: Track cash wire installments alongside barter/in-kind contributions (media spots, logistics vehicles, hospitality, beverages).
- **Deliverables Tracker**: Checklist to guarantee sponsor branding rights, LED billboard loops, on-ground booths, and VIP passes.
</details>

<details>
<summary><b>11. 👥 Crew Rostering & Honorarium Rates</b></summary>

- **Specialized Roles**: Profiles for Event Directors, Show Callers, Lighting Designers, FOH Audio Engineers, Rigging Leads, and Runners.
- **Call-Time & Shift Tracking**: Clear reporting times and call-time schedules.
- **Daily Rate & Honorarium Calculator**: Automatic honorarium calculations based on daily rates and multi-day commitments.
</details>

<details>
<summary><b>12. 📁 Centralized Documents Vault & Audit Trail</b></summary>

- **Document Categorization**: Secure archiving for CAD layouts, venue permits, police clearances, signed contracts, tax invoices, and post-event reports.
- **Immutable Audit Trail**: Detailed audit log capturing user IDs, timestamps, mutation types (`CREATE`, `UPDATE`, `APPROVE`, `STATUS_CHANGE`), and old vs. new value diffs.
</details>

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph TD
    Client["Next.js 15 Client (React 19 + Tailwind v4)"]
    Store["Client Reactive Store / Zustand / State Layer"]
    API["Next.js Route Handlers (App Router API)"]
    Prisma["Prisma ORM & PostgreSQL Client"]
    Supabase["Supabase (PostgreSQL, Storage, Auth)"]
    ERP["ERP Logistik Integration Layer (Future Sync)"]

    Client --> Store
    Store --> API
    API --> Prisma
    Prisma --> Supabase
    API -.-> ERP
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components) |
| **Core UI Library** | [React 19](https://react.dev/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/postcss`, `tw-animate-css` |
| **Charts & Analytics** | [Recharts 3](https://recharts.org/) |
| **Database & Schema** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/), [Supabase](https://supabase.com/) |
| **State & Data Store** | Dual Hybrid: Reactive singleton local store + Supabase SSR Client |
| **Language & Tooling**| TypeScript 5.9, ESLint 9, Node.js / Bun |

---

## 🔄 System Workflows

### 1. Equipment & Rider Fulfillment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Artist as Artist Liaison
    participant EMS as Event Management System
    participant Warehouse as Warehouse Inventory
    participant Vendor as External Rental Vendor

    Artist->>EMS: Submit Technical Rider (Audio / Backline / Mics)
    EMS->>EMS: Parse items into Rider Gear List
    alt Item Available in Internal Warehouse
        EMS->>Warehouse: Reserve SKU (status: RESERVED)
        Warehouse-->>EMS: Stock Allocated (status: ALLOCATED)
    else Item Not In Internal Stock
        EMS->>Vendor: Generate Request for Quotation (RFQ)
        Vendor-->>EMS: Return Quotation & Unit Price
        EMS->>Vendor: Issue Purchase Order (status: CONFIRMED_VENDOR)
    end
    EMS->>EMS: Dispatch to Event Loading Bay (status: DELIVERED)
```

### 2. Financial Disbursement & Approval Pipeline

```mermaid
flowchart LR
    Voucher["1. Payment Voucher Created"] --> PMApproval{"2. Project Manager Approval"}
    PMApproval -- Rejected --> Revised["Revision Required"]
    PMApproval -- Approved --> FinApproval{"3. Finance Director Approval"}
    FinApproval -- Rejected --> Revised
    FinApproval -- Approved --> Disbursed["4. Bank Disbursement & Settlement"]
```

---

## 📂 Module & Tab Breakdown

When opening any Event, EMS provides **14 specialized operational tabs**:

| Tab | Key Functionality |
| :--- | :--- |
| **1. Overview** | Executive summary, attendance targets, high-level financials, PIC roster, and venue summary. |
| **2. Timeline** | 7 key production dates, custom milestone agendas, tag color selector, and stage schedule. |
| **3. Budget** | Multi-category planned budget vs actual spend, tax calculation (PPN 11%), and variance margins. |
| **4. Artists** | Artist rosters, booking contracts, fee milestones, technical rider, and hospitality requirements. |
| **5. Procurement** | Vendor quotations, Purchase Order (PO) creation, and delivery date commitments. |
| **6. Revenue** | Commercial income tracking (Ticket sales, Tenant/Booth rental, Merchandising, Broadcast rights). |
| **7. Planning** | Task checklists, cross-team dependencies, and milestone Gantt charts. |
| **8. Rundown** | Cue-to-cue run sheet for show directors, stage managers, audio, lighting, and SFX operators. |
| **9. Crew** | Crew rosters, call times, specialized production roles, daily rates, and honorarium calculations. |
| **10. Logistics** | ERP inventory search modal, warehouse allocation, vendor assignment, and equipment lifecycle tracking. |
| **11. Risks** | Risk matrix registry (1–25 severity score), trigger factors, and concrete mitigation plans. |
| **12. Documents** | Secure repository for CAD stage plots, permits, contracts, insurance, and invoices. |
| **13. Payments** | Disbursement vouchers, bank account routing, and PM-to-Finance approval gates. |
| **14. Reports** | P&L statements, gross margin analytics, budget execution metrics, and post-event analysis. |

---

## 👥 Role-Based Access Control (RBAC)

EMS incorporates granular role definitions tailored to live entertainment and event enterprises:

- 👑 **`SUPER_ADMIN`**: Full platform authority across financial, operational, and system audit settings.
- 🎯 **`EVENT_DIRECTOR`**: High-level governance, contract approval, and overall production strategy.
- 💼 **`PROJECT_MANAGER`**: End-to-end event execution, milestone management, and primary payment approvals.
- 🛠️ **`PRODUCTION_MANAGER`**: Stage operations, schedule enforcement, rundown management, and crew oversight.
- 🎛️ **`TECHNICAL_MANAGER`**: Audio, lighting, video LED, power generator, and rigging specifications.
- 💵 **`FINANCE`**: Budget allocations, tax invoices, purchase order clearance, and disbursement releases.
- 🛒 **`PROCUREMENT`**: Vendor bidding, RFQs, contract negotiations, and external PO issuing.
- 🎨 **`CREATIVE`**: Theme conceptualization, visual content, marketing collateral, and stage designs.
- 🤝 **`SALES`**: Client acquisition, ticketing strategies, booth rentals, and corporate sponsorship.
- 👁️ **`VIEWER`**: Read-only stakeholder access for sponsors, venue hosts, or auditors.

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: v18.18.0 or newer (v20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **PostgreSQL**: PostgreSQL database instance (or Supabase project)

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mcaesarar2-boop/Event-Management.git
   cd Event-Management
   ```

2. **Install project dependencies**:
   ```bash
   # Using npm
   npm install

   # Or using bun
   bun install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   *(See [Environment Variables](#-environment-variables) for configuration details)*

4. **Initialize Database Schema (Prisma / Supabase)**:
   ```bash
   # Push schema to your PostgreSQL database
   npx prisma db push

   # (Optional) Seed mock data into Supabase
   npx tsx scripts/seed_supabase.ts
   ```

5. **Start the local development server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

6. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔐 Environment Variables

Ensure the following keys are provided in your `.env.local` file:

```ini
# PostgreSQL Connection URL (Supabase Pooler / Direct Postgres)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase API Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# (Optional) Google Gemini API (if enabling automated rider / AI assistance)
GEMINI_API_KEY="AIzaSy..."
```

---

## 🗂️ Project Structure

```text
Event-Management/
├── app/                              # Next.js App Router root
│   ├── api/                          # REST API route handlers
│   │   ├── events/                   # Event CRUD & sub-resource endpoints
│   │   │   └── [id]/                 # Event detail, budget, requirements routes
│   │   └── reports/                  # Aggregated reporting endpoints
│   ├── globals.css                   # Tailwind CSS v4 design tokens
│   ├── layout.tsx                    # Main app layout
│   └── page.tsx                      # Primary dynamic workspace controller
├── components/                       # Modular UI Components
│   ├── dashboard/                    # Global executive dashboard & KPI cards
│   ├── events/                       # Event list & creation modal
│   │   ├── detail/                   # 14 Event Detail Tabs & modal pickers
│   │   └── timeline/                 # Production timeline & milestone tag selector
│   ├── finance/                      # Master finance & sponsorship views
│   ├── governance/                   # Audit logs, documents vault, reports, risks
│   ├── layout/                       # Sidebar, header, & global search modal
│   ├── logistics/                    # ERP Logistics hub & inventory sync view
│   ├── planning/                     # Calendar, Gantt charts, & task checklists
│   └── stakeholders/                 # Artists, crew, clients, venues, & vendor views
├── hooks/                            # Custom React hooks
├── lib/                              # Core libraries & utilities
│   ├── db/                           # Singleton state store & seed mock data
│   ├── supabase/                     # Supabase client, server, storage, & services
│   ├── types/                        # Enterprise TypeScript domain definitions
│   └── utils/                        # Formatting, rider sync, & timeline helpers
├── prisma/
│   └── schema.prisma                 # Relational PostgreSQL data schema
├── scripts/                          # DB migrations, storage setup, & seed scripts
└── package.json                      # Dependencies and scripts configuration
```

---

# 🇮🇩 Bahasa Indonesia

## 🌟 Ringkasan Proyek

**Event Management System (EMS)** adalah platform komprehensif berstandar enterprise yang dirancang khusus untuk memenuhi kebutuhan operasional promotor konser, penyelenggara festival musik (*festival organizer*), *event organizer* (EO), dan *production house*. 

Sistem ini menghubungkan seluruh pilar produksi acara—mulai dari **Executive Producer, Technical Director, Tim Keuangan (Finance), Tim Logistik Gudang, hingga Manajemen Artis** dalam satu sistem terintegrasi. Hal ini mengeliminasi miskomunikasi lembar kerja (*spreadsheet* terpisah), mencegah *overbudget*, memastikan akurasi *rundown cue-to-cue*, serta mempermudah pengadaan (*procurement*) barang sewa maupun inventaris internal.

---

## ⚡ Fitur Utama Sistem

<details open>
<summary><b>1. 🎯 Dashboard Global & Portofolio Multi-Event</b></summary>

- **Health Score Otomatis**: Memantau status kesehatan event (`HEALTHY`, `WARNING`, `CRITICAL`) berdasarkan deviasi anggaran, tenggat waktu kritis, serta risiko yang belum dimitigasi.
- **Ringkasan Keuangan Eksekutif**: Mengagregasikan total pagu anggaran, realisasi biaya, deviasi pengeluaran, penerimaan kas, dan proyeksi laba bersih di semua event aktif.
- **Pencarian Cepat Global (`Ctrl+K` / `Cmd+K`)**: Fitur pencarian instan untuk melacak nama event, artis, kru, nomor Purchase Order (PO), dokumen, hingga checklist tugas.
</details>

<details>
<summary><b>2. ⏱️ Timeline Produksi & Manajemen Milestone</b></summary>

- **7 Fase Produksi Utama**: Manajemen tanggal dan jam operasional untuk `Load-In`, `Setup`, `Technical Rehearsal`, `General Rehearsal`, `Show Day`, `Strike`, dan `Load-Out`.
- **Kustomisasi Tag Milestone**: Label dan badge berwarna fleksibel (`rose`, `sky`, `amber`, `emerald`, `indigo`, dll.) untuk menandai agenda teknis penting.
- **Gantt Chart & Master Calendar**: Kalender terpadu multi-event untuk mengantisipasi bentrok jadwal pemakaian venue atau tumpang tindih penugasan kru.
</details>

<details>
<summary><b>3. 💰 Anggaran & Rekayasa Finansial (Budgeting)</b></summary>

- **Kategorisasi Anggaran Terperinci**: Pemisahan pos biaya (*Sound & Lighting, Staging, Fee Artis, Sewa Venue, Logistik, Honor Kru, Pemasaran, hingga Dana Kontinjensi*).
- **Kalkulasi Selisih (Planned vs Actual Variance)**: Perhitungan varians otomatis yang memperingatkan tim jika realisasi belanja melebihi pagu awal.
- **Pajak & Standar Indonesia**: Mendukung kalkulasi PPN 11%, PPh 21, PPh 23, Pajak Hiburan, serta potongan diskon vendor.
</details>

<details>
<summary><b>4. 🎤 Manajemen Artis & Rider Teknis / Hospitaliti</b></summary>

- **Database & Status Booking Artis**: Pelacakan status dari `Inquiry`, `Negotiation`, `Confirmed`, hingga `Contracted`.
- **Dukungan Rider Ganda**:
  - **Technical Rider**: Stage plot, channel input list, spesifikasi sistem monitor, FOH mixer, backline alat musik, dan skenario tata cahaya.
  - **Hospitality Rider**: Permintaan ruang tunggu (*green room*), akomodasi hotel, transportasi bandara, konsumsi (*F&B*), dan kuota tiket tamu VIP.
- **Sinkronisasi Rider ke Logistik**: Pencocokan kebutuhan alat musik/audio artis secara langsung ke inventaris gudang atau ke vendor rekanan luar.
</details>

<details>
<summary><b>5. 📦 Integrasi ERP Logistik & Inventaris Alat</b></summary>

- **Pemilihan Alat dari Inventaris Internal**: Modal pemilih (*picker*) terpadu untuk mengecek ketersediaan speaker, mixer, lampu panggung, LED screen, genset, dan rigging.
- **Alih Sewa ke Vendor Luar**: Jika stok gudang tidak mencukupi, sistem langsung mengalihkan item ke vendor rental luar dan membuat PO terkait.
- **Siklus Hidup Status Barang**: Pelacakan status logistik dari `DRAFT` ➔ `REQUESTED` ➔ `RESERVED` ➔ `ALLOCATED` ➔ `DELIVERED` ➔ `RETURNED`.
</details>

<details>
<summary><b>6. 🎬 Rundown Panggung Real-time & Cue Lapangan</b></summary>

- **Tabel Rundown Cue-to-Cue**: Matriks penayangan segmen acara menit demi menit yang siap digunakan oleh *Show Caller* dan *Stage Manager*.
- **Instruksi Khusus Tiap Departemen**: Kolom instruksi eksplisit untuk divisi **Audio, Lighting, Video/LED visual, SFX (Pyrotechnics/Confetti)**, dan penanggung jawab (PIC).
- **Dukungan Acara Multi-Hari**: Pengorganisasian rundown terpisah untuk festival berdurasi lebih dari satu hari (`Day 1`, `Day 2`, dst.).
</details>

<details>
<summary><b>7. 🛡️ Matriks & Manajemen Risiko Acara</b></summary>

- **Matriks Risiko 5x5**: Perhitungan skor tingkat keparahan otomatis (`Probabilitas × Dampak = Skor 1–25`) dengan pengelompokan Low, Medium, High, dan Critical.
- **Prosedur Mitigasi & Kontinjensi**: Pendaftaran langkah pencegahan sebelum hari-H dan tindakan darurat (*contingency plan*) jika insiden terjadi.
</details>

<details>
<summary><b>8. 📜 Pengadaan & Purchase Order (PO) Vendor</b></summary>

- **Direktori Vendor & Penilaian Kinerja**: Profil rekanan lengkap dengan nomor NPWP, data rekening bank, bidang spesialisasi, dan rating kepuasan (1–5 bintang).
- **Konversi Penawaran ke PO**: Membandingkan dokumen penawaran harga (*quotation*) vendor dan mengubah penawaran yang disetujui menjadi dokumen resmi PO.
</details>

<details>
<summary><b>9. 💳 Permintaan Pembayaran & Approval Berjenjang</b></summary>

- **Approval Dua Tahap**: Menjaga integritas arus kas di mana setiap voucher pengeluaran harus disetujui oleh Project Manager sebelum diverifikasi dan dicairkan oleh bagian Finance (`PENDING_PM` ➔ `PENDING_FINANCE` ➔ `APPROVED` ➔ `DISBURSED`).
- **Data Rekening & Cetak Voucher**: Penomoran voucher otomatis (`VCH-101`) beserta nama bank, nomor rekening, dan tanggal jatuh tempo pencairan.
</details>

<details>
<summary><b>10. 🤝 Manajemen Sponsor & Kemitraan Komersial</b></summary>

- **Skema Tingkatan Sponsor (Tiered Sponsorship)**: Pengelompokan paket dari *Title / Platinum Sponsor, Gold Sponsor, Silver Sponsor, Bronze Sponsor, hingga Media Partner*.
- **Kontribusi Tunai & Barter (In-Kind)**: Pencatatan dana masuk tunai serta kontribusi natura (misal: kendaraan operasional, publikasi radio, konsumsi).
- **Pelacakan Komitmen (Deliverables)**: Daftar periksa pemenuhan hak sponsor (pemasangan logo backdrop, penayangan iklan LED, booth komersial, tiket VIP).
</details>

<details>
<summary><b>11. 👥 Penjadwalan Kru & Honorarium</b></summary>

- **Daftar Peran Spesifik**: Pengaturan tugas untuk Event Director, Show Caller, Audio Engineer, Lighting Operator, Runner, Medis, hingga Tim Keamanan.
- **Pencatatan Call Time**: Waktu hadir di lokasi (*call time*) dan jam kerja teknis.
- **Kalkulator Honorarium**: Perhitungan otomatis total honor kru berdasarkan tarif harian (*daily rate*) dan jumlah hari kerja produksi.
</details>

<details>
<summary><b>12. 📁 Brankas Dokumen Digital & Jejak Audit (Audit Trail)</b></summary>

- **Pusat Arsip Dokumen**: Pengunggahan file CAD denah venue, surat izin kepolisian, kontrak artis, polis asuransi, faktur pajak, dan laporan evaluasi acara.
- **Log Audit Lengkap**: Mencatat rekam jejak pengguna, tanggal/waktu, jenis aksi (`CREATE`, `UPDATE`, `APPROVE`, `STATUS_CHANGE`), dan riwayat nilai sebelum/sesudah perubahan.
</details>

---

## 🛠️ Arsitektur & Tumpukan Teknologi

| Lapisan | Teknologi |
| :--- | :--- |
| **Framework Frontend** | [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components) |
| **Pustaka UI & Animasi** | [React 19](https://react.dev/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Desain & Tata Letak** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/postcss`, `tw-animate-css` |
| **Visualisasi Data & Grafik** | [Recharts 3](https://recharts.org/) |
| **Basis Data & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/), [Supabase](https://supabase.com/) |
| **Manajemen State** | Hybrid: Reactive singleton local store + Supabase SSR Client |
| **Bahasa & Perkakas** | TypeScript 5.9, ESLint 9, Node.js / Bun |

---

## 🔄 Alur Kerja Sistem (Workflow)

### 1. Alur Pemenuhan Rider Alat Musik & Teknis

```text
[Manajemen Artis / Rider]
         │
         ▼
[Input Spesifikasi Rider Teknis di EMS]
         │
         ├─────────────────────────────────────────┐
         ▼ (Stok Tersedia)                         ▼ (Stok Tidak Ada / Kurang)
[Alokasikan Inventaris Internal Gudang]   [Ajukan Permintaan Penawaran ke Vendor Sewa]
         │                                         │
         ▼ (Status: RESERVED -> ALLOCATED)         ▼ (Buat Purchase Order / PO)
         └───────────────────┬─────────────────────┘
                             ▼
              [Barang Tiba di Loading Bay Venue]
                             │
                             ▼
              [Pemeriksaan & Serah Terima (DELIVERED)]
                             │
                             ▼
              [Pembongkaran & Pengembalian (RETURNED)]
```

### 2. Alur Pembayaran & Verifikasi Voucher

```text
[Pengajuan Biaya Produksi / Honor] 
         │
         ▼
[Voucher Pembayaran Terbit (PENDING_PM)]
         │
         ▼
[Persetujuan Project Manager (PENDING_FINANCE)]
         │
         ▼
[Persetujuan Bagian Keuangan (APPROVED)]
         │
         ▼
[Pencairan Dana ke Rekening Tujuan (DISBURSED)]
```

---

## 📂 Daftar Modul & Tab Event

Setiap halaman detail acara dilengkapi dengan **14 tab kerja spesifik**:

1. **Overview**: Ringkasan umum acara, target jumlah penonton, ringkasan biaya, PIC utama, dan profil venue.
2. **Timeline**: 7 tanggal penting produksi, jadwal jam kegiatan, pengaturan tag agenda, dan timeline panggung.
3. **Budget**: Rincian anggaran per kategori, realisasi biaya aktual, kalkulasi PPN 11%, dan deviasi saldo.
4. **Artists**: Data artis yang tampil, kontrak pembayaran bertahap, technical rider, dan hospitality rider.
5. **Procurement**: Penawaran harga vendor luar, penerbitan Purchase Order (PO), dan estimasi pengiriman alat.
6. **Revenue**: Sumber pendapatan acara (Penjualan tiket, sewa tenant/booth makanan, hak siar, dana sponsor).
7. **Planning**: Daftar tugas per divisi (*task checklist*), ketergantungan antar-tugas, dan diagram Gantt.
8. **Rundown**: Lembar kerja rundown cue-to-cue untuk kru panggung, operator lighting, sound engineer, dan SFX.
9. **Crew**: Roster penugasan kru, call time kehadiran, jabatan produksi, dan rincian honor harian.
10. **Logistics**: Pencarian stok gudang internal, alih sewa ke vendor, pencocokan SKU, dan status perlengkapan.
11. **Risks**: Matriks risiko (skor 1–25), identifikasi faktor pemicu, dan rencana pencegahan serta kontinjensi.
12. **Documents**: Brankas penyimpanan file denah CAD, surat perizinan aparat/venue, kontrak, dan faktur pajak.
13. **Payments**: Permintaan pencairan dana, rincian nomor rekening, dan alur persetujuan PM ➔ Finance.
14. **Reports**: Analisis laba rugi (*P&L*), efisiensi penyerapan anggaran, dan laporan evaluasi pasca-acara.

---

## 👥 Kontrol Akses Berbasis Peran (RBAC)

EMS membagi hak akses ke dalam 10 tingkatan peran fungsional:

| Peran | Tanggung Jawab Utama |
| :--- | :--- |
| **`SUPER_ADMIN`** | Akses penuh ke seluruh konfigurasi sistem, database, dan pembagian hak pengguna. |
| **`EVENT_DIRECTOR`** | Pengawasan arah acara, pengesahan kontrak tingkat tinggi, dan evaluasi strategis. |
| **`PROJECT_MANAGER`** | Pimpinan operasional proyek, pengesahan milestone, dan verifikasi awal voucher biaya. |
| **`PRODUCTION_MANAGER`** | Penanggung jawab teknis panggung, eksekusi rundown, dan alokasi logistik lapangan. |
| **`TECHNICAL_MANAGER`** | Perancang spesifikasi teknis sound system, tata lampu, LED video, genset, dan struktur rigging. |
| **`FINANCE`** | Pengelola arus kas, penerbit faktur pajak, verifikasi dokumen belanja, dan pencairan pembayaran. |
| **`PROCUREMENT`** | Negosiator rekanan vendor, komparasi penawaran harga, dan penerbit dokumen PO resmi. |
| **`CREATIVE`** | Perancang konsep tema acara, materi visual, dekorasi panggung, dan aset promosi. |
| **`SALES`** | Pengelola kerjasama sponsor, penjualan tiket, dan kemitraan tenant komersial. |
| **`VIEWER`** | Akses baca saja (*read-only*) untuk pihak luar seperti auditor, perwakilan venue, atau mitra. |

---

## 🚀 Panduan Instalasi & Menjalankan

### Kebutuhan Perangkat Lunak
- **Node.js**: Versi 18.18.0 atau lebih baru (Disarankan versi 20 LTS)
- **Manajer Paket**: `npm`, `pnpm`, atau `bun`
- **Database PostgreSQL**: Akun Supabase aktif atau instalasi PostgreSQL lokal

### Langkah-Langkah Menjalankan Proyek

1. **Unduh repositori proyek**:
   ```bash
   git clone https://github.com/mcaesarar2-boop/Event-Management.git
   cd Event-Management
   ```

2. **Pasang dependensi pustaka**:
   ```bash
   # Menggunakan npm
   npm install

   # Atau menggunakan bun
   bun install
   ```

3. **Buat file konfigurasi `.env.local`**:
   Salin contoh konfigurasi lingkungan:
   ```bash
   cp .env.example .env.local
   ```
   Isi konfigurasi sesuai kredensial database dan Supabase Anda.

4. **Sinkronisasi Skema Basis Data (Prisma / Supabase)**:
   ```bash
   # Sinkronisasi skema ke database PostgreSQL
   npx prisma db push

   # (Opsional) Masukkan data awal simulasi (seed)
   npx tsx scripts/seed_supabase.ts
   ```

5. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   # atau
   bun dev
   ```
   Buka peramban (*browser*) Anda di alamat [http://localhost:3000](http://localhost:3000).

6. **Kompilasi Versi Produksi**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔐 Konfigurasi Lingkungan (.env)

Pastikan variabel-variabel berikut telah tersedia pada berkas `.env.local`:

```ini
# URL Koneksi PostgreSQL (Pooler Supabase atau Postgres Mandiri)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Konfigurasi Akses API Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# (Opsional) Google Gemini API Key jika mengaktifkan asisten AI
GEMINI_API_KEY="AIzaSy..."
```

---

## 📄 License

This project is proprietary software developed for enterprise event operations. All rights reserved.

<div align="center">
  <sub>Built with precision for the live entertainment industry. Crafted with Next.js 15, Supabase, and Tailwind CSS v4.</sub>
</div>

---

### System Audit, Architecture & Logic Health Check Report [v1.7.0]

**Audit Date**: 16 September 2026  
**Audited By**: Automated Deep Analysis (5 parallel auditors covering all 60+ source files)  
**Version Bump**: `1.6.1` → `1.7.0` (MINOR — significant systemic logic corrections)

#### 1. Evaluasi Konsistensi Struktur Folder & Modularitas

| Aspek | Status | Catatan |
| :--- | :---: | :--- |
| Separation of Concerns | ✅ BAIK | Pemisahan `app/`, `components/`, `hooks/`, `lib/`, `prisma/`, `scripts/` sudah sesuai standar Next.js App Router |
| Penamaan File & Folder | ✅ KONSISTEN | PascalCase untuk komponen, camelCase untuk utilitas, kebab-case untuk hooks |
| Barrel Exports | ✅ ADA | `lib/supabase/index.ts`, `lib/types/index.ts` sudah menyediakan barrel exports |
| File Dead/Unused | ✅ DIBERSIHKAN | `scratch_check_supabase.cjs` (file scratch ERP) telah dihapus dari root proyek |
| Duplikasi Komponen | ✅ TIDAK ADA | Tidak ditemukan file komponen duplikat |

#### 2. Daftar Cacat Logika Sistemik & Kalkulasi yang Ditemukan

| No | Kategori | File | Deskripsi Masalah | Solusi |
| :---: | :--- | :--- | :--- | :--- |
| A1 | 🔴 KRITIS | `lib/db/store.ts` | `hydrateEventRollup()` menggunakan `\|\|` sehingga nilai `0` yang sah jatuh ke fallback lama | Diganti `\|\|` → `??` (nullish coalescing) |
| A2 | 🔴 KRITIS | `lib/db/store.ts` | `createBudgetItem()` — quantity `0` dianggap `1` | Diganti `\|\|` → `??` |
| A3 | 🔴 KRITIS | `lib/db/store.ts` | `purgeEvent()` & `clearAllEvents()` tidak membersihkan array `sponsorships` | Ditambahkan filter sponsorship |
| A4 | 🔴 KRITIS | `lib/db/store.ts` | `initFromSupabase()` mengabaikan database kosong (tetap pakai seed data) | Dihapus guard `length > 0` |
| A5 | 🔴 KRITIS | `MasterFinanceView.tsx` | Reduce fallback ganda `\|\|` menyebabkan NaN saat cost = 0 | Diganti → `?? 0` |
| B1 | 🟠 SEDANG | `EventBudgetTab`, `EventRevenueTab`, `GlobalDashboard` | `.reduce()` tanpa fallback `?? 0` pada field numerik | Ditambahkan `?? 0` |
| B2 | 🟠 SEDANG | `EventProcurementTab.tsx` | Presisi floating-point pada kalkulasi PPN 11% | Diganti → `Math.round((subtotal * 11) / 100)` |
| B3 | 🟠 SEDANG | `lib/utils/format.ts` | `formatCompactIDR` memakai titik desimal (`.`) bukan koma (`,`) per standar Indonesia | Ditambahkan `.replace('.', ',')` |
| C1 | 🟡 MINOR | `MasterCalendar`, `MilestoneGantt` | `useState` inisialisasi stale saat data async belum tersedia | Ditambahkan `useEffect` sinkronisasi |
| C2 | 🟡 MINOR | `InternalAllocationConfirmModal`, `RiderGearComboboxInput` | State update pada komponen yang sudah unmounted (memory leak) | Ditambahkan flag `isMounted` |
| C3 | 🟡 MINOR | `EventReportsTab.tsx` | Penggunaan `as any` cast yang tidak type-safe | Diganti dengan proper typed access |
| D2 | 🟢 CLEANUP | `lib/types/index.ts` | `PaymentStatus` memiliki duplikasi UPPERCASE & TitleCase | Dinormalisasi ke UPPERCASE saja |
| D3 | 🟢 CLEANUP | `lib/supabase/services.ts` | Method `update()` pada events, budget, dan artists hanya memetakan sebagian field | Diperlengkapi semua field mapping |

#### 3. Status Kestabilan & Kesiapan Aplikasi

| Metrik | Hasil |
| :--- | :--- |
| **TypeScript Compilation** | ✅ Zero errors (`npx tsc --noEmit`) |
| **Next.js Production Build** | ✅ Build berhasil tanpa error (`npm run build`) |
| **Cacat Logika Kritis** | ✅ Semua 5 bug kritis telah diperbaiki |
| **NaN/Division-by-Zero Risk** | ✅ Semua jalur kalkulasi finansial telah dilindungi |
| **Memory Leak** | ✅ Async effect cleanup ditambahkan pada 2 komponen |
| **Dead Code** | ✅ File scratch dihapus, tipe duplikat dinormalisasi |
| **Supabase Sync Integrity** | ✅ Semua service `update()` memetakan field secara lengkap |
| **Kesiapan Produksi** | ✅ STABIL — Siap untuk staging deployment |

