import { DataTypes } from 'sequelize';
import sequelize from './db.js';

export const Institution = sequelize.define('Institution', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  address: DataTypes.TEXT,
  contact_email: DataTypes.STRING(255),
  phone: DataTypes.STRING(20),
  approved_status: {
    type: DataTypes.ENUM('pending', 'approved', 'suspended'),
    defaultValue: 'pending',
  },
}, { tableName: 'institutions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('institution_admin', 'aicte_officer', 'auditor'),
    defaultValue: 'institution_admin',
  },
  institution_id: DataTypes.INTEGER,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

export const FDRRecord = sequelize.define('FDRRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  institution_id: { type: DataTypes.INTEGER, allowNull: false },
  bank_name: { type: DataTypes.STRING(255), allowNull: false },
  branch_name: DataTypes.STRING(255),
  instrument_ref: { type: DataTypes.STRING(100), allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  issue_date: { type: DataTypes.DATEONLY, allowNull: false },
  maturity_date: { type: DataTypes.DATEONLY, allowNull: false },
  renewal_date: DataTypes.DATEONLY,
  interest_rate: DataTypes.DECIMAL(5, 2),
  status: {
    type: DataTypes.ENUM('submitted', 'under_verification', 'maturity_pending', 'renewal_requested', 'release_requested', 'released', 'expired'),
    defaultValue: 'submitted',
  },
  submission_notes: DataTypes.TEXT,
  created_by: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'fdr_records', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

export const FDRDocument = sequelize.define('FDRDocument', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fdr_id: { type: DataTypes.INTEGER, allowNull: false },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_type: DataTypes.STRING(50),
  file_size: DataTypes.INTEGER,
  uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'fdr_documents', timestamps: false });

export const AuditTrail = sequelize.define('AuditTrail', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fdr_id: DataTypes.INTEGER,
  action: { type: DataTypes.STRING(100), allowNull: false },
  old_status: DataTypes.STRING(50),
  new_status: DataTypes.STRING(50),
  performed_by: { type: DataTypes.INTEGER, allowNull: false },
  notes: DataTypes.TEXT,
  metadata: DataTypes.JSON,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'audit_trail', timestamps: false });

export const Verification = sequelize.define('Verification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fdr_id: { type: DataTypes.INTEGER, allowNull: false },
  verified_by: { type: DataTypes.INTEGER, allowNull: false },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'discrepancy_found', 'manual_review'),
    defaultValue: 'pending',
  },
  evidence_notes: DataTypes.TEXT,
  verified_at: DataTypes.DATE,
}, { tableName: 'verifications', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fdr_id: { type: DataTypes.INTEGER, allowNull: false },
  alert_type: {
    type: DataTypes.ENUM('maturity_90', 'maturity_30', 'maturity_7', 'overdue', 'verification_pending'),
    allowNull: false,
  },
  recipient_email: { type: DataTypes.STRING(255), allowNull: false },
  scheduled_at: DataTypes.DATE,
  sent_at: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
  },
}, { tableName: 'alerts', timestamps: false });

// Associations
Institution.hasMany(User, { foreignKey: 'institution_id' });
User.belongsTo(Institution, { foreignKey: 'institution_id' });

Institution.hasMany(FDRRecord, { foreignKey: 'institution_id' });
FDRRecord.belongsTo(Institution, { foreignKey: 'institution_id' });

// Creator association (who created the FDR)
FDRRecord.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });
User.hasMany(FDRRecord, { as: 'CreatedFDRs', foreignKey: 'created_by' });

FDRRecord.hasMany(FDRDocument, { foreignKey: 'fdr_id' });
FDRDocument.belongsTo(FDRRecord, { foreignKey: 'fdr_id' });

FDRRecord.hasMany(AuditTrail, { foreignKey: 'fdr_id' });
AuditTrail.belongsTo(FDRRecord, { foreignKey: 'fdr_id' });

// Actor in audit trail (who performed the action)
AuditTrail.belongsTo(User, { as: 'Actor', foreignKey: 'performed_by' });
User.hasMany(AuditTrail, { as: 'Actions', foreignKey: 'performed_by' });

FDRRecord.hasMany(Verification, { foreignKey: 'fdr_id' });
Verification.belongsTo(FDRRecord, { foreignKey: 'fdr_id' });

FDRRecord.hasMany(Alert, { foreignKey: 'fdr_id' });
Alert.belongsTo(FDRRecord, { foreignKey: 'fdr_id' });
