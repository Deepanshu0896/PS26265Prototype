import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Institution, User, AuditTrail, FDRRecord } from '../models/index.js';

const router = express.Router();

// Get all institutions
router.get('/', protect, authorize('aicte_officer', 'auditor'), async (req, res) => {
  try {
    const institutions = await Institution.findAll({
      include: [{ model: FDRRecord, attributes: ['id', 'status'] }],
    });
    res.json({ success: true, data: institutions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get audit trail
router.get('/audit', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows } = await AuditTrail.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: User, as: 'Actor', foreignKey: 'performed_by', attributes: ['name', 'role'] },
        { model: FDRRecord, attributes: ['instrument_ref', 'bank_name'] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
