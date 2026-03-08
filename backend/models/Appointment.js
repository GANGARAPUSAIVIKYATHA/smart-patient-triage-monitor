const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientName: String,
  doctorName: String,
  department: String,
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Waiting', 'In Progress', 'Checked', 'Not Available', 'Completed'],
    default: 'Waiting'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
