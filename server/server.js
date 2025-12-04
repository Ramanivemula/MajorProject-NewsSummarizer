const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { verifyTransport } = require('./utils/mailer');
const { startScheduler } = require('./utils/scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();
// Verify email transporter (non-fatal if fails)
verifyTransport();

// Start daily email scheduler (will only send if transporter works and preferences exist)
startScheduler();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
// NewsData.io based endpoints (optional alternative source)
app.use('/api/newsdata', require('./routes/newsDataRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});
