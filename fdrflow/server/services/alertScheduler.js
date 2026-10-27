import cron from 'node-cron';
import { Op } from 'sequelize';
import { FDRRecord, Institution, Alert } from '../models/index.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAlert = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: `"FDRFlow AICTE" <${process.env.EMAIL_USER}>`, to, subject, html });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
};

const checkMaturityAlerts = async () => {
  const today = new Date();
  const thresholds = [
    { days: 90, type: 'maturity_90', label: '90 days' },
    { days: 30, type: 'maturity_30', label: '30 days' },
    { days: 7, type: 'maturity_7', label: '7 days' },
  ];

  for (const threshold of thresholds) {
    const targetDate = new Date(today.getTime() + threshold.days * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const fdrs = await FDRRecord.findAll({
      where: {
        maturity_date: { [Op.between]: [startOfDay, endOfDay] },
        status: { [Op.notIn]: ['released', 'expired'] },
      },
      include: [{ model: Institution }],
    });

    for (const fdr of fdrs) {
      // Check if alert already sent
      const existing = await Alert.findOne({
        where: { fdr_id: fdr.id, alert_type: threshold.type, status: 'sent' },
      });
      if (existing) continue;

      const email = fdr.Institution?.contact_email;
      if (!email) continue;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #0ea5e9); padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚠️ FDRFlow Maturity Alert</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 8px; margin-top: 16px;">
            <p style="font-size: 16px; color: #374151;">Dear ${fdr.Institution.name} Administrator,</p>
            <p>Your FDR is maturing in <strong style="color: #dc2626;">${threshold.label}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f1f5f9;"><td style="padding: 8px 12px; font-weight: bold;">Instrument Reference</td><td style="padding: 8px 12px;">${fdr.instrument_ref}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: bold;">Bank</td><td style="padding: 8px 12px;">${fdr.bank_name}</td></tr>
              <tr style="background: #f1f5f9;"><td style="padding: 8px 12px; font-weight: bold;">Amount</td><td style="padding: 8px 12px;">₹${Number(fdr.amount).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: bold;">Maturity Date</td><td style="padding: 8px 12px; color: #dc2626; font-weight: bold;">${fdr.maturity_date}</td></tr>
            </table>
            <p>Please log in to <strong>FDRFlow Portal</strong> to take the necessary action (renewal or release request).</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.CLIENT_URL}" style="background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open FDRFlow Portal</a>
            </div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">This is an automated alert from FDRFlow | AICTE Security Deposit Portal</p>
        </div>
      `;

      const sent = await sendAlert(email, `⚠️ FDR Maturity Alert: ${threshold.label} remaining - ${fdr.instrument_ref}`, html);

      await Alert.create({
        fdr_id: fdr.id,
        alert_type: threshold.type,
        recipient_email: email,
        scheduled_at: new Date(),
        sent_at: sent ? new Date() : null,
        status: sent ? 'sent' : 'failed',
      });
    }
  }
};

// Run every day at 8:00 AM
export const startAlertScheduler = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Alert Scheduler] Checking maturity alerts...');
    await checkMaturityAlerts();
    console.log('[Alert Scheduler] Done.');
  });
  console.log('[Alert Scheduler] Started - runs daily at 8:00 AM');
};
