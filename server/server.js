const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const { connectDB } = require('./config/db');


const models = require('./models');


const authRoutes = require('./routes/auth.routes');
const dogReportRoutes = require('./routes/dogReport.routes');
const ownerRoutes = require('./routes/owner.routes');
const passwordResetRoutes = require('./routes/passwordReset.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();


connectDB();


app.use(cors({
  origin: function(origin, callback) {
    
    if (!origin) return callback(null, true);
    
    
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api/dog-reports', dogReportRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});
