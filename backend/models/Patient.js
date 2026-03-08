const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  age: Number,
  gender: String,
  phone: String,
  symptoms: String,
  bloodPressure: String,
  heartRate: String,
  temperature: String,
  preExistingConditions: String,
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  recommendedDepartment: String,
  doctorAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  appointmentTime: String,
  status: {
    type: String,
    enum: ['Waiting', 'In Progress', 'Checked', 'Not Available', 'Completed'],
    default: 'Waiting'
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
