import bcrypt from 'bcryptjs';
import { Institution, User, FDRRecord, AuditTrail } from '../models/index.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('🌱 Database already contains data. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Seeding initial demo data for AICTE FDR Portal...');

    // 1. Create Institutions
    const institutions = await Institution.bulkCreate([
      { name: 'IIT Delhi', address: 'Hauz Khas, New Delhi - 110016', contact_email: 'admin@iitd.ac.in', phone: '9876543210', approved_status: 'approved' },
      { name: 'NIT Trichy', address: 'Tanjore Main Road, Tiruchirappalli - 620015', contact_email: 'admin@nitt.edu', phone: '9876543211', approved_status: 'approved' },
      { name: 'BITS Pilani', address: 'Vidya Vihar, Pilani - 333031', contact_email: 'admin@bits-pilani.ac.in', phone: '9876543212', approved_status: 'approved' },
      { name: 'VIT Vellore', address: 'Tiruvalam Rd, Vellore - 632014', contact_email: 'admin@vit.ac.in', phone: '9876543213', approved_status: 'approved' },
      { name: 'Amity University', address: 'Sector 125, Noida - 201313', contact_email: 'admin@amity.edu', phone: '9876543214', approved_status: 'approved' },
    ]);

    // 2. Create Users
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const officer = await User.create({
      name: 'AICTE Officer',
      email: 'officer@aicte.in',
      password_hash: passwordHash,
      role: 'aicte_officer',
      institution_id: null,
      is_active: true,
    });

    const auditor = await User.create({
      name: 'Audit Officer',
      email: 'auditor@aicte.in',
      password_hash: passwordHash,
      role: 'auditor',
      institution_id: null,
      is_active: true,
    });

    const iitAdmin = await User.create({
      name: 'IIT Delhi Admin',
      email: 'admin@iitd.ac.in',
      password_hash: passwordHash,
      role: 'institution_admin',
      institution_id: institutions[0].id,
      is_active: true,
    });

    const nitAdmin = await User.create({
      name: 'NIT Trichy Admin',
      email: 'admin@nitt.edu',
      password_hash: passwordHash,
      role: 'institution_admin',
      institution_id: institutions[1].id,
      is_active: true,
    });

    const bitsAdmin = await User.create({
      name: 'BITS Admin',
      email: 'admin@bits-pilani.ac.in',
      password_hash: passwordHash,
      role: 'institution_admin',
      institution_id: institutions[2].id,
      is_active: true,
    });

    // 3. Create Sample FDRs
    const fdrs = await FDRRecord.bulkCreate([
      {
        institution_id: institutions[0].id,
        bank_name: 'State Bank of India',
        branch_name: 'Hauz Khas Branch',
        instrument_ref: 'SBI/FDR/2024/001',
        amount: 5000000.00,
        issue_date: '2024-01-15',
        maturity_date: '2026-01-15',
        interest_rate: 7.25,
        status: 'under_verification',
        submission_notes: 'Annual security deposit as per AICTE norms',
        created_by: iitAdmin.id,
      },
      {
        institution_id: institutions[0].id,
        bank_name: 'Punjab National Bank',
        branch_name: 'IIT Delhi Branch',
        instrument_ref: 'PNB/FDR/2024/045',
        amount: 3500000.00,
        issue_date: '2024-03-10',
        maturity_date: '2025-11-10',
        interest_rate: 6.80,
        status: 'maturity_pending',
        submission_notes: 'Renewal FDR for 2024-25',
        created_by: iitAdmin.id,
      },
      {
        institution_id: institutions[1].id,
        bank_name: 'Bank of Baroda',
        branch_name: 'Trichy Main',
        instrument_ref: 'BOB/FDR/2023/112',
        amount: 4200000.00,
        issue_date: '2023-06-01',
        maturity_date: '2025-12-01',
        interest_rate: 7.10,
        status: 'submitted',
        submission_notes: 'Fresh deposit submission',
        created_by: nitAdmin.id,
      },
      {
        institution_id: institutions[1].id,
        bank_name: 'Canara Bank',
        branch_name: 'NIT Branch',
        instrument_ref: 'CAN/FDR/2024/078',
        amount: 2800000.00,
        issue_date: '2024-02-20',
        maturity_date: '2026-02-20',
        interest_rate: 6.95,
        status: 'under_verification',
        submission_notes: 'Security deposit Q1 2024',
        created_by: nitAdmin.id,
      },
      {
        institution_id: institutions[2].id,
        bank_name: 'HDFC Bank',
        branch_name: 'Pilani',
        instrument_ref: 'HDFC/FDR/2024/033',
        amount: 6000000.00,
        issue_date: '2024-04-01',
        maturity_date: '2026-04-01',
        interest_rate: 7.50,
        status: 'released',
        submission_notes: 'Completed and released',
        created_by: bitsAdmin.id,
      },
      {
        institution_id: institutions[2].id,
        bank_name: 'ICICI Bank',
        branch_name: 'Pilani Branch',
        instrument_ref: 'ICICI/FDR/2024/067',
        amount: 4500000.00,
        issue_date: '2024-07-15',
        maturity_date: '2026-07-15',
        interest_rate: 7.30,
        status: 'submitted',
        submission_notes: 'New security deposit 2024',
        created_by: bitsAdmin.id,
      },
      {
        institution_id: institutions[3].id,
        bank_name: 'Union Bank',
        branch_name: 'Vellore Main',
        instrument_ref: 'UBI/FDR/2024/021',
        amount: 3000000.00,
        issue_date: '2024-01-01',
        maturity_date: '2025-12-31',
        interest_rate: 6.75,
        status: 'renewal_requested',
        submission_notes: 'Requesting renewal for next year',
        created_by: iitAdmin.id,
      },
      {
        institution_id: institutions[0].id,
        bank_name: 'Axis Bank',
        branch_name: 'Delhi',
        instrument_ref: 'AXIS/FDR/2024/099',
        amount: 2500000.00,
        issue_date: '2024-08-01',
        maturity_date: '2026-08-01',
        interest_rate: 7.15,
        status: 'submitted',
        submission_notes: 'Additional security deposit',
        created_by: iitAdmin.id,
      },
      {
        institution_id: institutions[1].id,
        bank_name: 'State Bank of India',
        branch_name: 'Trichy',
        instrument_ref: 'SBI/FDR/2025/005',
        amount: 3800000.00,
        issue_date: '2025-01-10',
        maturity_date: '2027-01-10',
        interest_rate: 7.00,
        status: 'submitted',
        submission_notes: 'Annual deposit 2025',
        created_by: nitAdmin.id,
      },
      {
        institution_id: institutions[4].id,
        bank_name: 'Bank of India',
        branch_name: 'Noida Sector 62',
        instrument_ref: 'BOI/FDR/2024/044',
        amount: 5500000.00,
        issue_date: '2024-05-15',
        maturity_date: '2026-05-15',
        interest_rate: 7.20,
        status: 'under_verification',
        submission_notes: 'Amity security deposit',
        created_by: iitAdmin.id,
      },
    ]);

    // 4. Create Audit Trail
    await AuditTrail.bulkCreate([
      { fdr_id: fdrs[0].id, action: 'STATUS_CHANGE', old_status: 'submitted', new_status: 'under_verification', performed_by: officer.id, notes: 'Documents received, starting verification' },
      { fdr_id: fdrs[1].id, action: 'STATUS_CHANGE', old_status: 'submitted', new_status: 'under_verification', performed_by: officer.id, notes: 'Initial review started' },
      { fdr_id: fdrs[1].id, action: 'STATUS_CHANGE', old_status: 'under_verification', new_status: 'maturity_pending', performed_by: officer.id, notes: 'Verified. Maturity approaching in 30 days' },
      { fdr_id: fdrs[4].id, action: 'STATUS_CHANGE', old_status: 'submitted', new_status: 'under_verification', performed_by: officer.id, notes: 'Documents verified successfully' },
      { fdr_id: fdrs[4].id, action: 'STATUS_CHANGE', old_status: 'under_verification', new_status: 'released', performed_by: officer.id, notes: 'Approved for release by competent authority' },
      { fdr_id: fdrs[6].id, action: 'STATUS_CHANGE', old_status: 'under_verification', new_status: 'renewal_requested', performed_by: nitAdmin.id, notes: 'Institution requested renewal before maturity' },
    ]);

    console.log('✅ Initial demo data seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
};
