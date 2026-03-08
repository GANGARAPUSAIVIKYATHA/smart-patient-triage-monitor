const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: String,
  age: Number,
  gender: String,
  symptoms: String,
  bloodPressure: String,
  heartRate: String,
  temperature: String,
  preExistingConditions: String,
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true
  },
  confidenceScore: Number,
  explanation: [String],
  recommendedDepartment: String,
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  doctorName: String,
  department: String,
  status: String,
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
