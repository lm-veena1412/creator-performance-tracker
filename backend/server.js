const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const creatorRoutes = require('./routes/creators');
const performanceRoutes = require('./routes/performance');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/performance', performanceRoutes);

app.get('/', (req, res) => {
  res.send('Creator Performance Tracker API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST}`);

  // Auto-run seed on first startup if needed
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment detected');
    console.log('Note: Make sure to run migrate.js and seed.js manually via Render Shell');
  }
});
