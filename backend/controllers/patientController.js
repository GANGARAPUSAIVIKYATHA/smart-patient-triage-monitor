const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Analysis = require('../models/Analysis');
const Doctor = require('../models/Doctor');
const { analyzeTriage } = require('../ai/triageService');

const submitHealthData = async (req, res) => {
  const { symptoms, bloodPressure, heartRate, temperature, preExistingConditions, age, gender } = req.body;

  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const triageResult = analyzeTriage({
      symptoms, bloodPressure, heartRate, temperature, preExistingConditions
    });

    // Update patient data
    patient.symptoms = symptoms;
    patient.bloodPressure = bloodPressure;
    patient.heartRate = heartRate;
    patient.temperature = temperature;
    patient.preExistingConditions = preExistingConditions;
    patient.riskLevel = triageResult.riskLevel;
    patient.recommendedDepartment = triageResult.recommendedDepartment;
    await patient.save();

    // Create Analysis Record
    const analysis = await Analysis.create({
      patient: patient._id,
      patientName: req.user.name,
      age: age || patient.age,
      gender: gender || patient.gender,
      symptoms,
      bloodPressure,
      heartRate,
      temperature,
      preExistingConditions,
      riskLevel: triageResult.riskLevel,
      confidenceScore: triageResult.confidenceScore,
      explanation: triageResult.explanation,
      recommendedDepartment: triageResult.recommendedDepartment,
      status: 'Waiting'
    });

    // Real-time update
    const io = req.app.get('socketio');
    io.emit('newPatientData', { patient, analysis });

    res.status(201).json({ patient, analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  const { department, doctorId, timeSlot } = req.body;

  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const doctor = await Doctor.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: 'Patient or Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      patientName: req.user.name,
      doctorName: doctor.name,
      department,
      appointmentTime: timeSlot,
      status: 'Waiting'
    });

    // Link doctor to patient
    patient.doctorAssigned = doctor._id;
    patient.appointmentTime = timeSlot;
    await patient.save();

    // Link appointment to analysis if exists
    const latestAnalysis = await Analysis.findOne({ patient: patient._id }).sort({ createdAt: -1 });
    if (latestAnalysis) {
      latestAnalysis.appointmentId = appointment._id;
      latestAnalysis.doctorId = doctor._id;
      latestAnalysis.doctorName = doctor.name;
      latestAnalysis.department = department;
      await latestAnalysis.save();
    }

    const io = req.app.get('socketio');
    io.emit('appointmentBooked', appointment);

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const records = await Analysis.find({ patient: patient._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitHealthData, bookAppointment, getMyRecords };
