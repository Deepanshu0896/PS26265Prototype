import { Op } from 'sequelize';
import { FDRRecord, Institution, User, FDRDocument, AuditTrail, Verification } from '../models/index.js';
import sequelize from '../models/db.js';

// Get all FDRs (role-filtered)
export const getFDRs = async (req, res) => {
  try {
    const { status, institution_id, page = 1, limit = 10, search } = req.query;
    const where = {};

    // Institution admins see only their own institution
    if (req.user.role === 'institution_admin') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { instrument_ref: { [Op.like]: `%${search}%` } },
        { bank_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await FDRRecord.findAndCountAll({
      where,
      include: [
        { model: Institution, attributes: ['name'] },
        { model: User, as: 'Creator', foreignKey: 'created_by', attributes: ['name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single FDR with full details
export const getFDRById = async (req, res) => {
  try {
    const fdr = await FDRRecord.findByPk(req.params.id, {
      include: [
        { model: Institution, attributes: ['name', 'contact_email'] },
        { model: FDRDocument },
        { model: AuditTrail, include: [{ model: User, as: 'Actor', foreignKey: 'performed_by', attributes: ['name', 'role'] }], order: [['created_at', 'DESC']] },
        { model: Verification },
      ],
    });

    if (!fdr) return res.status(404).json({ success: false, message: 'FDR not found' });

    // Restrict institution_admin to their own
    if (req.user.role === 'institution_admin' && fdr.institution_id !== req.user.institution_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: fdr });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create FDR
export const createFDR = async (req, res) => {
  try {
    const { bank_name, branch_name, instrument_ref, amount, issue_date, maturity_date, interest_rate, submission_notes } = req.body;

    const institution_id = req.user.role === 'institution_admin'
      ? req.user.institution_id
      : req.body.institution_id;

    const fdr = await FDRRecord.create({
      institution_id,
      bank_name,
      branch_name,
      instrument_ref,
      amount,
      issue_date,
      maturity_date,
      interest_rate,
      submission_notes,
      created_by: req.user.id,
      status: 'submitted',
    });

    await AuditTrail.create({
      fdr_id: fdr.id,
      action: 'FDR_CREATED',
      new_status: 'submitted',
      performed_by: req.user.id,
      notes: `FDR ${instrument_ref} submitted`,
    });

    res.status(201).json({ success: true, data: fdr, message: 'FDR submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update FDR status (workflow)
export const updateFDRStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const fdr = await FDRRecord.findByPk(req.params.id);
    if (!fdr) return res.status(404).json({ success: false, message: 'FDR not found' });

    const oldStatus = fdr.status;
    fdr.status = status;
    await fdr.save();

    await AuditTrail.create({
      fdr_id: fdr.id,
      action: 'STATUS_CHANGE',
      old_status: oldStatus,
      new_status: status,
      performed_by: req.user.id,
      notes: notes || `Status changed from ${oldStatus} to ${status}`,
    });

    res.json({ success: true, data: fdr, message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const institutionFilter = req.user.role === 'institution_admin'
      ? { institution_id: req.user.institution_id }
      : {};

    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const isSqlite = sequelize.getDialect() === 'sqlite';
    const monthCol = isSqlite
      ? sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at'))
      : sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m');

    const [
      totalFDRs,
      activeFDRs,
      expiringSoon,
      pendingVerification,
      releaseRequests,
      totalAmountResult,
      statusBreakdown,
      monthlyData,
    ] = await Promise.all([
      FDRRecord.count({ where: { ...institutionFilter } }),
      FDRRecord.count({ where: { ...institutionFilter, status: { [Op.notIn]: ['released', 'expired'] } } }),
      FDRRecord.count({
        where: {
          ...institutionFilter,
          maturity_date: { [Op.between]: [today, thirtyDaysLater] },
          status: { [Op.notIn]: ['released', 'expired'] },
        },
      }),
      FDRRecord.count({ where: { ...institutionFilter, status: 'under_verification' } }),
      FDRRecord.count({ where: { ...institutionFilter, status: 'release_requested' } }),
      FDRRecord.sum('amount', { where: { ...institutionFilter } }),
      FDRRecord.findAll({
        where: { ...institutionFilter },
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      FDRRecord.findAll({
        where: { ...institutionFilter },
        attributes: [
          [monthCol, 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        ],
        group: [monthCol],
        order: [[monthCol, 'ASC']],
        limit: 12,
        raw: true,
      }),
    ]);

    // Recent audit trail
    const recentActivity = await AuditTrail.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [
        { model: User, as: 'Actor', foreignKey: 'performed_by', attributes: ['name', 'role'] },
        { model: FDRRecord, attributes: ['instrument_ref', 'bank_name'] },
      ],
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalFDRs,
          activeFDRs,
          expiringSoon,
          pendingVerification,
          releaseRequests,
          totalAmount: totalAmountResult || 0,
        },
        statusBreakdown,
        monthlyData,
        recentActivity,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submit verification
export const submitVerification = async (req, res) => {
  try {
    const { verification_status, evidence_notes } = req.body;
    const fdr = await FDRRecord.findByPk(req.params.id);
    if (!fdr) return res.status(404).json({ success: false, message: 'FDR not found' });

    const verification = await Verification.create({
      fdr_id: fdr.id,
      verified_by: req.user.id,
      verification_status,
      evidence_notes,
      verified_at: new Date(),
    });

    if (verification_status === 'verified') {
      fdr.status = 'maturity_pending';
      await fdr.save();
      await AuditTrail.create({
        fdr_id: fdr.id,
        action: 'VERIFICATION_COMPLETE',
        old_status: 'under_verification',
        new_status: 'maturity_pending',
        performed_by: req.user.id,
        notes: evidence_notes,
      });
    }

    res.json({ success: true, data: verification, message: 'Verification recorded' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
