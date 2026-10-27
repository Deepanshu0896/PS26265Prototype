# FDRFlow 🏦
### AICTE Security Deposit / FDR Management Portal
**SIH 2026 | PS 26265 | Smart Automation | Software**

> **Secure. Trackable. Transparent.**

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm
- MySQL 8.0+

### 1. Database Setup
```bash
# Create the database and seed data
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```
Server runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
App runs at: `http://localhost:5173`

---

## 🔐 Demo Credentials (Sample Data)

| Role | Email | Password |
|------|-------|----------|
| AICTE Officer | officer@aicte.in | Admin@123 |
| Auditor | auditor@aicte.in | Admin@123 |
| Institution Admin (IIT Delhi) | admin@iitd.ac.in | Admin@123 |
| Institution Admin (NIT Trichy) | admin@nitt.edu | Admin@123 |
| Institution Admin (BITS Pilani) | admin@bits-pilani.ac.in | Admin@123 |

> All data is **synthetic sample data** for prototype demonstration purposes only.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MySQL + Sequelize ORM |
| Auth | JWT + bcrypt |
| File Uploads | Multer |
| Email Alerts | Nodemailer + node-cron |

---

## 📋 Features

- ✅ **Role-Based Auth** — Institution Admin, AICTE Officer, Auditor
- ✅ **FDR Lifecycle** — Submit → Verify → Maturity → Release
- ✅ **Live Dashboard** — KPI cards + status pie chart + monthly bar chart
- ✅ **Search & Filter** — By status, bank, instrument reference
- ✅ **Verification Workflow** — Evidence-linked verification by officers
- ✅ **Audit Trail** — Every action logged with timestamp + user
- ✅ **Maturity Alerts** — Automated email reminders at 90/30/7 days
- ✅ **Workflow Steps** — Visual progress indicator per FDR

---

## 📁 Project Structure

```
fdrflow/
├── client/          # React.js frontend (Vite)
├── server/          # Node.js + Express backend
│   ├── controllers/ # Route handlers
│   ├── middleware/  # JWT auth, RBAC
│   ├── models/      # Sequelize ORM models
│   ├── routes/      # API endpoints
│   ├── services/    # Alert scheduler
│   └── uploads/     # Document storage
└── database/        # MySQL schema + seed data
```

---

## 🌐 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | All roles |
| GET | /api/fdrs/dashboard | All roles |
| GET | /api/fdrs | All roles |
| POST | /api/fdrs | Admin, Officer |
| GET | /api/fdrs/:id | All roles |
| PATCH | /api/fdrs/:id/status | Admin, Officer |
| POST | /api/fdrs/:id/verify | Officer only |
| GET | /api/institutions | Officer, Auditor |
| GET | /api/institutions/audit | All roles |

---

*FDRFlow — SIH 2026 · PS 26265 · AICTE · Smart Automation*
