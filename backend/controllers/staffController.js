const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

const getPatientQueue = async (req, res) => {
  try {
    const queue = await Patient.find({ status: { $ne: 'Completed' } })
      .sort({ riskLevel: 1, createdAt: 1 }); // HIGH risk levels should be sorted correctly, maybe use a map or specific order if High/Medium/Low strings don't sort well.
    
    // Custom sort HIGH > MEDIUM > LOW
    const priority = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    queue.sort((a, b) => priority[a.riskLevel] - priority[b.riskLevel]);

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ appointmentTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  const { appointmentId, status } = req.body;
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    // Sync with patient status if needed
    const patient = await Patient.findById(appointment.patient);
    if (patient) {
      patient.status = status;
      await patient.save();
    }

    const io = req.app.get('socketio');
    io.emit('appointmentUpdated', { appointmentId, status });

    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPatientQueue, getAppointments, updateAppointment };
