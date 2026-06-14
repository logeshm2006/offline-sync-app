require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Grievance = require('./models/Grievance');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ENV
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

// Check env
if (!MONGODB_URI) {
  console.error('❌ Missing MONGO_URI in .env');
  process.exit(1);
}

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET all grievances (for dashboard)
app.get('/api/grievances', async (req, res) => {
  try {
    const data = await Grievance.find().sort({ createdAt: -1 })
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch grievances' })
  }
});
// POST route
app.post('/api/grievances', async (req, res) => {
  try {
    const { name, village, category, description, priority, timestamp } = req.body;

    const grievance = new Grievance({
      name,
      village,
      category,
      description,
      priority,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    const saved = await grievance.save();

    console.log('Saved to MongoDB:', saved)

    return res.status(201).json(saved)

  } catch (err) {
    console.error('❌ Error saving grievance:', err);

    if (err && err.name === 'ValidationError') {
      const errors = Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message
        return acc
      }, {})
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    return res.status(500).json({ error: 'Server error' })
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});