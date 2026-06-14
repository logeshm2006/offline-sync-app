const mongoose = require('mongoose')
const { Schema } = mongoose

const grievanceSchema = new Schema({
  name: { type: String, trim: true },
  village: { type: String, required: [true, 'Village is required'], trim: true },
  category: { type: String, required: [true, 'Category is required'], enum: ['Water','Electricity','Road','Sanitation'] },
  description: { type: String, required: [true, 'Description is required'], trim: true, minlength: [5, 'Description too short'] },
  priority: { type: String, required: [true, 'Priority is required'], enum: ['Low','Medium','High'] },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Grievance', grievanceSchema)
