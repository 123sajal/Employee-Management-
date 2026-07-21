const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const dotenv  = require('dotenv');
const fs      = require('fs');

dotenv.config();

const { testConnection } = require('./database/db');
const authRoutes       = require('./routes/authRoutes');
const employeeRoutes   = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const roleRoutes       = require('./routes/roleRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({
  origin:         process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth',        authRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles',       roleRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'EMS API is running.', timestamp: new Date() })
);

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
);

// errorHandler must be last
app.use(errorHandler);

(async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀  EMS API running at http://localhost:${PORT}`);
    console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

module.exports = app;
