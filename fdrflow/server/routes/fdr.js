import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';
import {
  getFDRs,
  getFDRById,
  createFDR,
  updateFDRStatus,
  getDashboardStats,
  submitVerification,
} from '../controllers/fdrController.js';

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
});

import { FDRRecord, FDRDocument, AuditTrail } from '../models/index.js';

router.get('/dashboard', protect, getDashboardStats);
router.get('/', protect, getFDRs);
router.get('/:id', protect, getFDRById);
router.post('/', protect, authorize('institution_admin', 'aicte_officer'), createFDR);
router.patch('/:id/status', protect, authorize('aicte_officer', 'institution_admin'), updateFDRStatus);
router.post('/:id/verify', protect, authorize('aicte_officer'), submitVerification);

// Document upload for an FDR
router.post('/:id/documents', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fdr = await FDRRecord.findByPk(req.params.id);
    if (!fdr) return res.status(404).json({ success: false, message: 'FDR not found' });

    const doc = await FDRDocument.create({
      fdr_id: fdr.id,
      file_name: req.file.originalname,
      file_path: `/uploads/${req.file.filename}`,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      uploaded_by: req.user.id,
    });

    await AuditTrail.create({
      fdr_id: fdr.id,
      action: 'DOCUMENT_UPLOADED',
      performed_by: req.user.id,
      notes: `Uploaded file ${req.file.originalname}`,
    });

    res.status(201).json({ success: true, data: doc, message: 'Document uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
