import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Institution, AuditTrail } from '../models/index.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({
      where: { email },
      include: [{ model: Institution, attributes: ['name'] }],
    });

    if (!user || !user.is_active)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user.id);

    // Log login action
    await AuditTrail.create({
      fdr_id: null,
      action: 'USER_LOGIN',
      performed_by: user.id,
      notes: `User ${user.email} logged in`,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id,
        institution_name: user.Institution?.name || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] },
    include: [{ model: Institution, attributes: ['name', 'approved_status'] }],
  });
  res.json({ success: true, user });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
