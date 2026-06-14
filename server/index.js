require('dotenv').config()
console.log('SERVER FILE LOADED')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const Grievance = require('./src/models/Grievance')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('Missing MONGO_URI environment variable. Copy .env.example to .env and set MONGO_URI')
  process.exit(1)
}

// connect to MongoDB then start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })

app.get('/', (req, res) => res.json({ ok: true, service: 'grievance-backend' }))

// GET all grievances (cloud endpoint)
app.get('/api/grievances', async (req, res) => {
  console.log('GET ROUTE HIT')
  try {
    const data = await Grievance.find().sort({ createdAt: -1 })
    return res.json(data)
  } catch (err) {
    console.error('Error fetching grievances', err)
    return res.status(500).json({ error: 'Failed to fetch grievances' })
  }
})

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/grievances', async (req, res) => {
  const payload = req.body
  console.log('[POST /api/grievances] Received payload:', JSON.stringify(payload))

  const { name, village, category, description, priority, timestamp } = payload || {}

  if (!village || !description || !category || !priority) {
    return res.status(400).json({ error: 'Missing required fields' })
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
    console.log('[POST /api/grievances] Saved:', saved._id)
    return res.status(201).json(saved)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message, details: err.errors })
    }
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
