import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc = Document()

# Set page margins to 0.75 inches for clean professional report format
for section in doc.sections:
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

# Color Palette Constants
COLOR_NAVY = (10, 37, 64)       # Primary #0A2540
COLOR_BLUE = (30, 58, 138)      # Secondary #1E3A8A
COLOR_CYAN = (2, 132, 199)      # Accent #0284C7
COLOR_TEXT = (30, 41, 59)       # Body text #1E293B
COLOR_MUTED = (100, 116, 139)   # Subdued text #64748B

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_title(text, subtitle=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(26)
    run.bold = True
    run.font.color.rgb = RGBColor(*COLOR_NAVY)
    
    if subtitle:
        p2 = doc.add_paragraph()
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(14)
        run2 = p2.add_run(subtitle)
        run2.font.name = 'Calibri'
        run2.font.size = Pt(13)
        run2.font.color.rgb = RGBColor(*COLOR_CYAN)
        run2.bold = True

def add_heading_1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(16)
    run.bold = True
    run.font.color.rgb = RGBColor(*COLOR_NAVY)
    
    # Add a thin colored underline bar beneath H1
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(7.0)
    set_cell_background(cell, "0284C7")
    set_cell_margins(cell, top=10, bottom=10, left=0, right=0)
    p_bar = cell.paragraphs[0]
    p_bar.paragraph_format.space_before = Pt(0)
    p_bar.paragraph_format.space_after = Pt(0)
    r_bar = p_bar.add_run("")
    r_bar.font.size = Pt(1)
    
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(4)

def add_heading_2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(12.5)
    run.bold = True
    run.font.color.rgb = RGBColor(*COLOR_BLUE)

def add_heading_3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(11)
    run.bold = True
    run.font.color.rgb = RGBColor(*COLOR_TEXT)

def add_p(text, bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Calibri'
        r_pre.font.size = Pt(10)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(*COLOR_NAVY)
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(*COLOR_TEXT)
    return p

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Calibri'
        r_pre.font.size = Pt(10)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(*COLOR_NAVY)
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(*COLOR_TEXT)
    return p

def add_callout(text, title="KEY HIGHLIGHT", border_color="0284C7", bg_color="F0F9FF"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(7.0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"📌 {title}: ")
    run_title.bold = True
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(10)
    run_title.font.color.rgb = RGBColor(2, 132, 199)
    
    run_body = p.add_run(text)
    run_body.font.name = 'Calibri'
    run_body.font.size = Pt(9.5)
    run_body.font.color.rgb = RGBColor(30, 41, 59)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def add_styled_table(col_widths, headers, data, align_cols=None):
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    hdr_cells = tbl.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = Inches(col_widths[i])
        set_cell_background(hdr_cells[i], "0A2540")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(title)
        r.bold = True
        r.font.name = 'Calibri'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
    
    for row_idx, row_data in enumerate(data):
        row_cells = tbl.add_row().cells
        bg_col = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, val in enumerate(row_data):
            row_cells[col_idx].width = Inches(col_widths[col_idx])
            set_cell_background(row_cells[col_idx], bg_col)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[col_idx].paragraphs[0]
            if align_cols and col_idx in align_cols:
                p.alignment = align_cols[col_idx]
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(str(val))
            r.font.name = 'Calibri'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(30, 41, 59)
            
    tblPr = tbl._tbl.tblPr
    tblBorders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="none"/>
            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="0A2540"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(tblBorders)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

# ==============================================================================
# DOCUMENT CONTENT ASSEMBLY
# ==============================================================================

# Cover Header Banner
add_title("FDRFlow — Technical Architecture & Implementation Report", 
          "AICTE Security Deposit / Fixed Deposit Receipt (FDR) Lifecycle Automation Portal")

# Meta Info Box
add_styled_table(
    col_widths=[1.75, 5.25],
    headers=["Project Parameter", "Specification Details"],
    data=[
        ["Problem Statement ID", "PS 26265 (Smart India Hackathon 2026)"],
        ["Target Organization", "All India Council for Technical Education (AICTE), Ministry of Education"],
        ["Category & Domain", "Smart Automation / Software Solution"],
        ["Prototype Status", "Fully Functional, Live Local Deployment with Complete E2E Integration"],
        ["Frontend Environment", "http://localhost:5173 (React 18 + Vite SPA with Glassmorphic Design)"],
        ["Backend API Service", "http://localhost:5000 (Node.js + Express REST API + Background Cron)"],
        ["Database Architecture", "Dual-Engine: Zero-Config SQLite (Embedded) + Enterprise MySQL 8.0"],
        ["Date of Generation", "October 2026 | Technical Architecture Review"]
    ]
)

# ------------------------------------------------------------------------------
# SECTION 1: EXECUTIVE SUMMARY & PROBLEM CONTEXT
# ------------------------------------------------------------------------------
add_heading_1("1. Executive Summary & Problem Context")

add_p("Under prevailing AICTE statutory norms, thousands of engineering and technical institutions across India are mandatorily required to pledge substantial financial security deposits (typically ranging from ₹25 Lakhs to ₹1 Crore+ per institute) in the form of Fixed Deposit Receipts (FDRs) jointly held with AICTE. These deposits safeguard academic infrastructure, student interests, and faculty commitments.")

add_p("Traditionally, the management, renewal, tracking, and encashment/release of these high-value instruments has suffered from acute operational bottlenecks:")
add_bullet(" Institutes submit paper FDR certificates by post or couriers, leading to physical wear, misplacement risks, and lengthy manual record-keeping in decentralized spreadsheets.", "Manual Verification & Paper Vulnerability: ")
add_bullet(" Institutions and regulatory authorities regularly miss the 90-day/30-day renewal windows, causing FDRs to involuntarily enter low-interest auto-renewal or lapse into dormant accounts.", "Maturity Oversight & Revenue Leakage: ")
add_bullet(" In manual workflows, regulatory officers lack a centralized real-time dashboard of total pledged security deposits, verification backlogs, or bank-wise distributions across states.", "Opacity & Lack of Real-Time Analytics: ")
add_bullet(" There was no cryptographically signed, immutable record of which officer approved an FDR, who requested a release, or when verification was completed.", "Absence of Compliance Audit Trails: ")

add_callout(
    "FDRFlow completely eliminates these friction points by establishing an automated, unified, role-governed digital ecosystem where institutions submit FDRs electronically with proof documents, AICTE officers systematically verify instruments against banking standards, background daemons trigger proactive multi-tier maturity notifications, and all state transitions are immutably logged into an auditable ledger.",
    "THE FDRFLOW TRANSFORMATION"
)

# ------------------------------------------------------------------------------
# SECTION 2: SYSTEM ARCHITECTURE & TECH STACK
# ------------------------------------------------------------------------------
add_heading_1("2. System Architecture & Tech Stack Matrix")

add_p("FDRFlow follows an enterprise-grade, clean three-tier architecture with separation of concerns across the presentation layer, RESTful service layer, and persistence/daemon tier.")

add_heading_2("2.1 Architectural Components")
add_bullet(" Single Page Application (SPA) providing sub-millisecond route transitions, glassmorphic dark-mode dashboards, interactive lifecycle state machines, tabular filters, and dynamic forms with hot toasts.", "Presentation Tier (Client): ")
add_bullet(" Express.js REST application hosting JWT token authenticators, RBAC policy enforcement interceptors, Multer file upload storage, and controller business logic.", "API & Business Logic Tier: ")
add_bullet(" Object-Relational Mapping (ORM) layer featuring a dual-dialect engine (instant zero-config SQLite for local evaluation and rapid evaluation, plus high-throughput MySQL for production deployments).", "Data Persistence Tier: ")
add_bullet(" Embedded node-cron daemon running scheduled daily sweeps to calculate maturity thresholds (90, 30, and 7 days) and dispatch alerts.", "Asynchronous Alert Engine: ")

add_heading_2("2.2 Technology Stack Breakdown")

add_styled_table(
    col_widths=[1.5, 1.8, 3.7],
    headers=["Layer", "Technology Selected", "Architectural Justification & Role"],
    data=[
        ["Frontend Core", "React 18 + Vite SPA", "Lightning-fast HMR build, declarative component model, clean state management with AuthContext."],
        ["Styling System", "Vanilla CSS Design Tokens", "Zero-dependency CSS custom properties, responsive layout, glassmorphic cards, custom accessibility."],
        ["Iconography & UI", "Lucide React + Hot Toast", "Lightweight vector icons and non-blocking asynchronous floating feedback alerts."],
        ["Backend Runtime", "Node.js (ES Modules) + Express", "Asynchronous non-blocking event-driven execution, clean middleware pipeline, scalable REST APIs."],
        ["ORM & Modeling", "Sequelize ORM v6", "Model-driven schema definitions, automatic association joins, parameterized SQL injections defense."],
        ["Primary Database", "SQLite (Embedded Zero-Config)", "Delivers immediate plug-and-play local execution without installing external services."],
        ["Production DB", "MySQL 8.0+", "Supports enterprise scaling, transactions, foreign key indexing, and strict ACID guarantees."],
        ["Authentication", "JWT + Bcrypt.js (10 Rounds)", "Stateless bearer token exchange with salted cryptographic password hashing."],
        ["File Storage", "Multer Multipart Engine", "Handles authenticated FDR certificate scans and PDF bank guarantee proofs safely."],
        ["Background Cron", "node-cron Scheduler", "Automated daily checks evaluating FDR maturities and generating preemptive compliance alerts."]
    ]
)

# ------------------------------------------------------------------------------
# SECTION 3: FEATURES IMPLEMENTED IN THE PROTOTYPE
# ------------------------------------------------------------------------------
add_heading_1("3. Features Implemented in the Live Prototype")

add_p("The FDRFlow system implements the complete functional lifecycle envisioned by AICTE guidelines and the SIH Problem Statement:")

add_heading_2("3.1 Role-Based Access Control (RBAC) & Authentication")
add_bullet(" Complete authority to inspect all institutions, verify deposited FDRs, record official verification notes, advance workflow states, and authorize FDR renewals or fund releases.", "AICTE Officer (Regulatory Admin): ")
add_bullet(" Dedicated view allowing institute authorized representatives (e.g. IIT Delhi, NIT Trichy, BITS Pilani) to register new FDR instruments, upload certificate copies, monitor status, and request timely renewals.", "Institution Admin (Depositor): ")
add_bullet(" Read-only forensic view with full access to the complete, immutable system audit log, status transition timelines, and verification timestamps.", "Compliance Auditor: ")
add_bullet(" Login screen features interactive one-click role chips allowing evaluators to instantly switch between AICTE Officer, Auditor, and Institution Admin without manual credential typing.", "One-Click Quick Login Chips: ")

add_heading_2("3.2 Five-Stage FDR Lifecycle State Machine")
add_p("FDRFlow enforces strict lifecycle state transitions, preventing unauthorized or out-of-order state mutations:")
add_bullet(" Institution submits the FDR instrument details, bank guarantee number, pledge amount, maturity date, and certificate attachment.", "Stage 1: Submitted — ")
add_bullet(" AICTE Officer reviews banking details against bank confirmation letters, records verification notes, and marks instrument as verified or flags discrepancies.", "Stage 2: Under Verification — ")
add_bullet(" System tracks deposit during its active validity period; as the instrument approaches its deadline (90, 30, or 7 days), automated alerts flag pending action.", "Stage 3: Maturity Pending — ")
add_bullet(" Institution requests deposit extension, or submits formal request for release/encashment upon completion of AICTE statutory pledge period.", "Stage 4: Renewal / Release Requested — ")
add_bullet(" Formal authorization by competent authority releasing funds back to the institution or closing the instrument upon completion.", "Stage 5: Released / Expired — ")

add_heading_2("3.3 Executive Dashboard & Real-Time KPI Analytics")
add_bullet(" Aggregates total financial security value across all accredited technical universities (e.g. ₹3.88 Crores in demo registry).", "Total Deposit Value Portfolio: ")
add_bullet(" Highlights fresh submissions awaiting regulatory officer review to prevent administrative backlogs.", "Pending Verifications Counter: ")
add_bullet(" Proactively isolates deposits reaching maturity within the next 30 to 90 days, preventing inadvertent auto-renewals.", "Maturity Watchlist Widget: ")
add_bullet(" Distribution breakdown visualizer displaying counts for Submitted, Under Verification, Maturity Pending, and Released statuses.", "Status Breakdown Bar: ")

add_heading_2("3.4 Interactive FDR Registry with Multi-Criteria Filtering")
add_bullet(" Instantly filter deposits by 'All', 'Submitted', 'Under Verification', 'Maturity Pending', 'Renewal Requested', or 'Released'.", "Status Pipeline Tabs: ")
add_bullet(" Real-time search across Bank Name (SBI, PNB, BOB, HDFC, ICICI, etc.), Instrument Reference Number, and Institution Name.", "Multi-Column Instant Search: ")
add_bullet(" Color-coded indicators with pulse animation for urgent attention states (e.g., Red for overdue/renewal requested, Amber for under verification, Green for verified).", "Dynamic Status Badges: ")

add_heading_2("3.5 Deep FDR Detail Inspection & Verification Workstation")
add_bullet(" Visual step indicator displaying current position in the 5-phase journey with completed, active, and upcoming indicators.", "Graphical Lifecycle Stepper: ")
add_bullet(" Detailed breakdown of Institution, Bank & Branch, Instrument Ref, Principal Amount, Interest Rate, Issue Date, and Maturity Date.", "Financial Instrument Dossier: ")
add_bullet(" Exclusive to AICTE Officers — allows marking 'Verified', 'Discrepancy Found', or 'Manual Review' with mandatory evidence notes.", "Verification Action Form: ")
add_bullet(" Allows authorized transition of state with mandatory rationale logged into audit records.", "Workflow Transition Controller: ")
add_bullet(" Reverse chronological timeline showing every action, actor, timestamp, and notes associated with the specific FDR.", "FDR-Specific Audit Trail: ")

add_heading_2("3.6 Automated Background Alert & Maturity Notification Scheduler")
add_bullet(" An automated node-cron daemon checks the database daily at 08:00 AM.", "Proactive Monitoring Daemon: ")
add_bullet(" Computes delta days = (Maturity Date - Current Date). Automatically categorizes deposits into 90-Day Warning, 30-Day Warning, 7-Day Critical, and Overdue.", "Automated Multi-Tier Triggers: ")
add_bullet(" Creates pending alert records and dispatches email notifications to both the Institution Admin and the AICTE nodal officer.", "Dual Notification Delivery: ")

add_heading_2("3.7 Immutable Audit Trail & Regulatory Compliance Logging")
add_bullet(" Every critical operation (User Login, FDR Submission, Verification Action, Status Change, Document Upload) is automatically recorded.", "Universal Event Capture: ")
add_bullet(" Each audit entry stores FDR ID, Action Name, Previous Status, New Status, Performed By (User ID & Name), Timestamp, and Free-text rationale notes.", "Granular Change Metadata: ")
add_bullet(" Dedicated searchable audit explorer with pagination, action-type color tags, and user attribution for oversight teams.", "Dedicated Audit Explorer: ")

# ------------------------------------------------------------------------------
# SECTION 4: NOVEL INNOVATIONS & "NEW THINGS"
# ------------------------------------------------------------------------------
add_heading_1("4. Novel Innovations & 'New Things' in FDRFlow")

add_p("Beyond standard CRUD portals, FDRFlow introduces several high-impact software and architectural innovations designed specifically for regulatory efficiency and hackathon evaluation:")

add_heading_2("4.1 Smart Dual-Engine Database Abstraction (Zero-Config Portability)")
add_p("A frequent pitfall in prototype deployments is the dependency on external relational database daemons (like MySQL or PostgreSQL) being installed and running on the evaluation machine. FDRFlow features a smart Sequelize connection layer that seamlessly operates in two modes:")
add_bullet(" Out of the box, FDRFlow connects to an embedded SQLite database (`fdrflow.sqlite`). It requires zero installation, zero external services, and runs identically on Windows, Linux, or macOS.", "Mode A: Embedded SQLite (Zero-Config Local Evaluation): ")
add_bullet(" By simply updating `.env` (`DB_DIALECT=mysql`), the identical codebase connects to an enterprise MySQL server with connection pooling and high concurrency.", "Mode B: Enterprise MySQL: ")

add_heading_2("4.2 Automated In-Memory Seeding Engine")
add_p("Upon startup, FDRFlow automatically queries its user and institute tables. If empty, it executes an automated seeding sequence generating realistic, real-world data:")
add_bullet(" Pre-configures IIT Delhi, NIT Trichy, BITS Pilani, VIT Vellore, and Amity University.", "5 Accredited Institutions: ")
add_bullet(" Configures AICTE Regulatory Officer, Compliance Auditor, and 3 Institution Administrators with pre-hashed Bcrypt passwords.", "5 Pre-configured Role Personas: ")
add_bullet(" Seeds 10 realistic multi-lakh and multi-crore FDRs distributed across State Bank of India, PNB, Bank of Baroda, Canara Bank, HDFC, ICICI, Union Bank, and Bank of India.", "10 Diverse FDR Records: ")
add_bullet(" Populates realistic historical status updates and verification logs to immediately demonstrate compliance reporting.", "Initial Audit Trail: ")

add_heading_2("4.3 Evaluator-Centric One-Click Persona Switcher")
add_p("To streamline live judging and presentations, the login portal features dedicated quick-login action buttons (`AICTE Officer`, `Auditor`, `IIT Delhi Admin`, `NIT Trichy Admin`). Evaluators do not need to memorize passwords or type credentials — a single click loads the role and navigates to the appropriate dashboard context.")

add_heading_2("4.4 Visual State Machine Lifecycle Stepper")
add_p("Rather than displaying raw status text, FDRFlow features a 5-step interactive graphical stepper on every FDR detail view. Each phase dynamically reflects whether it has been completed, is currently active, or is awaiting future actions. This provides instant visual clarity for both university officials and government auditors.")

add_heading_2("4.5 Multi-Tier Automated Proactive Risk Detection")
add_p("Instead of relying on human vigilance to identify expiring deposits, the proactive background cron scanner automatically calculates risk horizons (90 days, 30 days, 7 days) and triggers targeted alerts, eliminating the risk of accidental revenue lapses or forgotten bank guarantees.")

# ------------------------------------------------------------------------------
# SECTION 5: DATABASE SCHEMA & DATA DICTIONARY
# ------------------------------------------------------------------------------
add_heading_1("5. Database Schema & Entity Relationships")

add_p("The FDRFlow relational model consists of 7 normalized entities with strict foreign key constraints:")

add_styled_table(
    col_widths=[1.5, 1.8, 3.7],
    headers=["Entity Name", "Primary Attributes", "Business Logic & Relationships"],
    data=[
        ["institutions", "id, name, address, contact_email, phone, approved_status", "Stores accredited universities and colleges. Has many Users and FDRRecords."],
        ["users", "id, name, email, password_hash, role, institution_id, is_active", "System actors. Role is ENUM('aicte_officer', 'institution_admin', 'auditor'). Belongs to Institution."],
        ["fdr_records", "id, institution_id, bank_name, instrument_ref, amount, dates, status", "Core financial instrument record. Tracks bank, amounts, dates, and 7 lifecycle statuses."],
        ["fdr_documents", "id, fdr_id, file_name, file_path, file_type, file_size, uploaded_by", "Stores scanned copy of FDR certificates and bank verification confirmation letters."],
        ["audit_trail", "id, fdr_id, action, old_status, new_status, performed_by, notes", "Immutable compliance ledger capturing every state change, user login, and administrative action."],
        ["verifications", "id, fdr_id, verified_by, verification_status, evidence_notes, verified_at", "Formal regulatory verification records with status ENUM('verified', 'discrepancy_found', etc.)."],
        ["alerts", "id, fdr_id, alert_type, recipient_email, scheduled_at, sent_at, status", "Scheduled and dispatched notifications for 90-day, 30-day, 7-day maturity warnings."]
    ]
)

# ------------------------------------------------------------------------------
# SECTION 6: REST API CATALOGUE
# ------------------------------------------------------------------------------
add_heading_1("6. REST API Endpoints Catalogue")

add_styled_table(
    col_widths=[1.0, 2.5, 1.3, 2.2],
    headers=["Method", "Endpoint Path", "Access Role", "Functional Description"],
    data=[
        ["POST", "/api/auth/login", "Public", "Authenticates user credentials, generates JWT token, and logs login action."],
        ["GET", "/api/auth/me", "Authenticated", "Returns authenticated user profile, assigned role, and institution affiliation."],
        ["GET", "/api/fdrs/stats", "Authenticated", "Calculates aggregated portfolio statistics (Total Value, Pending, Maturing, Counts)."],
        ["GET", "/api/fdrs", "Authenticated", "Returns filtered, searched, and paginated FDR records scoped by user role."],
        ["POST", "/api/fdrs", "Institution / Officer", "Registers fresh FDR record and initiates verification stage."],
        ["GET", "/api/fdrs/:id", "Authenticated", "Retrieves complete FDR instrument dossier, documents, and audit trail."],
        ["PUT", "/api/fdrs/:id/status", "Officer / Inst. Admin", "Executes authorized state transition with mandatory rationale."],
        ["POST", "/api/fdrs/:id/verify", "AICTE Officer Only", "Submits formal officer verification findings (verified, discrepancy, etc.)."],
        ["POST", "/api/fdrs/:id/documents", "Authenticated", "Uploads scanned FDR document proof using Multer multipart handling."],
        ["GET", "/api/fdrs/audit/trail", "Authenticated", "Returns paginated immutable system audit log with actor details."],
        ["GET", "/api/institutions", "Officer / Auditor", "Retrieves comprehensive list of technical institutions and their deposit counts."],
        ["GET", "/api/health", "Public", "System health diagnostic endpoint returning server status and timestamp."]
    ]
)

# ------------------------------------------------------------------------------
# SECTION 7: DEPLOYMENT & EVALUATION GUIDE
# ------------------------------------------------------------------------------
add_heading_1("7. Deployment & Verification Guide")

add_heading_2("7.1 Prerequisites")
add_bullet(" Node.js v18.0+ or higher and npm package manager.", "Runtime: ")
add_bullet(" Any standard web browser (Google Chrome, Microsoft Edge, Mozilla Firefox).", "Web Browser: ")
add_bullet(" Optional (Embedded SQLite is pre-configured and active by default).", "Database Server: ")

add_heading_2("7.2 How to Start the System Locally")
add_p("To run the application from the repository root:", space_after=2)

add_bullet(" Open PowerShell or Terminal and execute:", "Step 1 (Start Backend): ")
p_code1 = doc.add_paragraph()
p_code1.paragraph_format.left_indent = Inches(0.5)
p_code1.paragraph_format.space_before = Pt(2)
p_code1.paragraph_format.space_after = Pt(4)
r_c1 = p_code1.add_run("cd fdrflow\\server\nnpm start")
r_c1.font.name = 'Consolas'
r_c1.font.size = Pt(9.5)
r_c1.font.color.rgb = RGBColor(10, 37, 64)

add_bullet(" Open a second terminal window and execute:", "Step 2 (Start Frontend): ")
p_code2 = doc.add_paragraph()
p_code2.paragraph_format.left_indent = Inches(0.5)
p_code2.paragraph_format.space_before = Pt(2)
p_code2.paragraph_format.space_after = Pt(4)
r_c2 = p_code2.add_run("cd fdrflow\\client\nnpm run dev")
r_c2.font.name = 'Consolas'
r_c2.font.size = Pt(9.5)
r_c2.font.color.rgb = RGBColor(10, 37, 64)

add_bullet(" Open your browser and navigate to http://localhost:5173", "Step 3 (Access Web App): ")

add_heading_2("7.3 Recommended Evaluator Walkthrough")
add_bullet(" Click the 'AICTE Officer' quick button on the login screen and click 'Sign In'.", "1. Officer Overview: ")
add_bullet(" Observe the Total Portfolio Value (₹3.88 Crores), 4 Pending Verifications, and 2 Maturing Soon warnings.", "2. Inspect KPIs: ")
add_bullet(" Click on 'State Bank of India (SBI/FDR/2024/001)' to open the detail view. Inspect the visual lifecycle stepper.", "3. Workflow Stepper: ")
add_bullet(" As an AICTE Officer, submit a verification decision (e.g. 'Verified - Joint discharge signed') and witness the audit trail update immediately.", "4. Complete Verification: ")
add_bullet(" Click 'Audit Trail' in the sidebar to review the chronological, immutable log of all historical system operations.", "5. Audit Compliance: ")
add_bullet(" Logout and click 'IIT Delhi Admin'. Notice that the institution view is strictly partitioned to only show deposits belonging to IIT Delhi.", "6. Test Multi-Tenancy: ")

# Save Document
output_docx_path = r"c:\Users\Deepanshu\OneDrive\Desktop\protops26265\FDRFlow_Technical_Report.docx"
doc.save(output_docx_path)
print(f"DOCX Report successfully generated at: {output_docx_path}")
