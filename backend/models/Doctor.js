const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String, // Denormalized for quick access
  department: {
    type: String,
    required: true
  },
  experience: String,
  availability: {
    type: String,
    default: 'Available'
  },
  availableTime: String,
  hospitalId: String
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
