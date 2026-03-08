const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Analysis = require('../models/Analysis');

const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const patients = await Patient.find({
      $or: [
        { doctorAssigned: doctor._id },
        { recommendedDepartment: doctor.department }
      ]
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHighRiskPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const patients = await Patient.find({
      $or: [
        { doctorAssigned: doctor._id },
        { recommendedDepartment: doctor.department }
      ],
      riskLevel: 'HIGH'
    }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  const { patientId, status } = req.body;
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.status = status;
    await patient.save();

    // Update analysis record status too
    await Analysis.updateMany({ patient: patient._id }, { status });

    const io = req.app.get('socketio');
    io.emit('statusUpdated', { patientId, status });

    res.json({ message: 'Status updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, getPatients, getHighRiskPatients, updateStatus };
