# FDRFlow 🏦
### AICTE Security Deposit & Fixed Deposit Receipt (FDR) Management Portal
**Smart India Hackathon (SIH 2026) | Problem Statement: PS 26265 | Category: Smart Automation (Software)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7.svg)](https://sequelize.org/)
[![Status](https://img.shields.io/badge/Status-Complete%20%26%20Deployed-success.svg)]()

> **Digitised. Transparent. Automated.**  
> A unified, role-governed portal for technical institutions and AICTE regulatory officers to submit, track, verify, and manage multi-crore fixed deposit security guarantees with automated maturity risk alerts and an immutable audit trail.

---

## 🌟 Key Features

- **🔐 Multi-Role RBAC Governance:**
  - **AICTE Officer:** Complete regulatory oversight, instrument verification, approval of renewals/releases, and institution tracking.
  - **Institution Admin:** Multi-tenant view scoped to accredited institutes (IIT Delhi, NIT Trichy, BITS Pilani, etc.) to submit deposits, attach proofs, and request release.
  - **Compliance Auditor:** Independent forensic view with access to the immutable system activity ledger.
- **⚡ One-Click Persona Switcher:** Quick-fill login buttons on the login screen for seamless evaluation and live demo testing.
- **🔄 5-Stage Lifecycle State Machine:** Strict validation workflow (`Submitted` ➔ `Under Verification` ➔ `Maturity Pending` ➔ `Renewal / Release Requested` ➔ `Released / Expired`) with dynamic graphical stepper.
- **📊 Real-Time Analytics Dashboard:** Instant visibility over total security deposit portfolio value in Crores, pending verification queues, and 30/90-day maturity watchlists.
- **⏰ Proactive Background Alert Daemon:** Built-in `node-cron` scheduler evaluating daily delta-days to maturity (90-day, 30-day, 7-day critical thresholds) with dual email notifications.
- **📜 Immutable Audit Trail:** Universal activity capture logging every user login, state mutation, document upload, and verification note with actor attribution and timestamps.
- **📁 Smart Dual-Engine Database:** Runs out of the box with embedded SQLite (`fdrflow.sqlite`) for instant zero-configuration local review, with transparent enterprise MySQL 8.0+ support via `.env`.

---

## 🏗️ Architecture & Tech Stack

```
                        ┌───────────────────────────────────────┐
                        │      React 18 SPA (Vite + CSS)        │
                        │    Dashboard · Stepper · Audit Log    │
                        └──────────────────┬────────────────────┘
                                           │ HTTP / Axios (JWT)
                                           ▼
                        ┌───────────────────────────────────────┐
                        │       Express.js REST Service         │
                        │   RBAC Guards · Multer · Controllers  │
                        └───────┬──────────────────────┬────────┘
                                │                      │
                 Sequelize ORM  │                      │ node-cron
                                ▼                      ▼
               ┌────────────────────────┐    ┌───────────────────┐
               │  Dual-Engine Database  │    │  Daily Proactive  │
               │   SQLite (Zero-Setup)  │    │   Maturity Scan   │
               │   MySQL (Production)   │    │  (90 / 30 / 7 d)  │
               └────────────────────────┘    └───────────────────┘
```

| Layer | Technologies | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Lucide React, React Hot Toast | SPA UI, dark-mode design system, live filter pipeline, visual stepper |
| **Backend** | Node.js, Express.js (ES Modules) | RESTful API, JWT tokens, RBAC policy middleware, Multer file engine |
| **Database** | SQLite (Embedded) / MySQL 8.0+ | Relational schema, automated seeder, foreign key constraints |
| **Automation**| node-cron, Nodemailer | Scheduled background sweeps, risk horizon computation |

---

## 🔑 Demo Credentials (Pre-Seeded)

All demo accounts share the password: **`Admin@123`**

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **AICTE Officer** | `officer@aicte.in` | `Admin@123` | Full administrative control, verify FDRs, approve renewals/releases |
| **Compliance Auditor** | `auditor@aicte.in` | `Admin@123` | Read-only forensic view, complete audit trail access |
| **IIT Delhi Admin** | `admin@iitd.ac.in` | `Admin@123` | Institution admin scoped to IIT Delhi deposits (₹85+ Lakhs) |
| **NIT Trichy Admin** | `admin@nitt.edu` | `Admin@123` | Institution admin scoped to NIT Trichy deposits |
| **BITS Pilani Admin** | `admin@bits-pilani.ac.in` | `Admin@123` | Institution admin scoped to BITS Pilani deposits |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- npm package manager

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/FDRFlow.git
cd FDRFlow
```

### 2. Start the Backend Server
```bash
cd fdrflow/server
npm install
npm start
```
> Server runs on `http://localhost:5000`. On first run, it automatically seeds realistic demo data for 5 top institutions, 5 user personas, and 10 FDR records.

### 3. Start the Frontend Client
```bash
cd ../client
npm install
npm run dev
```
> Client launches on `http://localhost:5173`. Open in your browser, select any demo persona, and explore the portal.

---

## 📖 API Endpoints Catalog

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and return JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role |
| `GET` | `/api/fdrs/dashboard`| Authenticated | Aggregated portfolio stats, monthly deposit trends & KPIs |
| `GET` | `/api/fdrs` | Authenticated | Scoped list of FDRs with search and status filtering |
| `POST` | `/api/fdrs` | Inst. Admin / Officer | Submit fresh FDR financial instrument |
| `GET` | `/api/fdrs/:id` | Authenticated | Full instrument dossier with visual stepper and audit trail |
| `PATCH`| `/api/fdrs/:id/status`| Officer / Inst. Admin | Advance or update lifecycle status with required notes |
| `POST` | `/api/fdrs/:id/verify`| AICTE Officer Only | Record formal officer verification findings |
| `POST` | `/api/fdrs/:id/documents`| Authenticated | Upload scanned FDR certificate or bank confirmation |
| `GET` | `/api/institutions/audit`| Authenticated | Full paginated system audit trail |
| `GET` | `/api/institutions` | Officer / Auditor | List all technical institutions with active deposit counts |
| `GET` | `/api/health` | Public | Health diagnostic check |

---

## 📑 Technical Documentation & Presentation
- **Detailed Architecture Report:** Available in Word ([FDRFlow_Technical_Report.docx](FDRFlow_Technical_Report.docx)) and PDF ([FDRFlow_Technical_Report.pdf](FDRFlow_Technical_Report.pdf)) formats.
- **Problem Statement Dossier:** [FDRFlow_SIH26265_PPT_Content.pdf](FDRFlow_SIH26265_PPT_Content.pdf).

---

## ⚖️ License
This project is developed for the Smart India Hackathon (SIH 2026) under Problem Statement PS 26265 and is released under the [MIT License](LICENSE).
