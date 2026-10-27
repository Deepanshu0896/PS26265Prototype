import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './models/db.js';
import authRoutes from './routes/auth.js';
import fdrRoutes from './routes/fdr.js';
import institutionRoutes from './routes/institutions.js';
import { startAlertScheduler } from './services/alertScheduler.js';
import { seedDatabase } from './services/seeder.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (restricted — in production use signed URLs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fdrs', fdrRoutes);
app.use('/api/institutions', institutionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FDRFlow API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    await sequelize.sync({ alter: false }); // Use migrations in production
    console.log('✅ Database synced');

    await seedDatabase();

    startAlertScheduler();

    app.listen(PORT, () => {
      console.log(`✅ FDRFlow Server running on http://localhost:${PORT}`);
      console.log(`   - API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
