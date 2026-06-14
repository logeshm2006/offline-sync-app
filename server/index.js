require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const Grievance = require('./src/models/Grievance')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 10000
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in environment variables')
  process.exit(1)
}

// Routes
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'grievance-backend' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// GET all grievances
app.get('/api/grievances', async (req, res) => {
  try {
    const data = await Grievance.find().sort({ createdAt: -1 })
    res.json(data)
  } catch (err) {
    console.error('Fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch grievances' })
  }
})

// POST grievance
app.post('/api/grievances', async (req, res) => {
  const { name, village, category, description, priority, timestamp } = req.body

  if (!village || !description || !category || !priority) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (description && description.length < 5) {
    return res.status(400).json({ error: 'Description must be at least 5 characters' })
  }

  try {
    const doc = new Grievance({
      name,
      village,
      category,
      description,
      priority,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    })

    const saved = await doc.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    console.error('Save error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Connect DB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected')
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  })