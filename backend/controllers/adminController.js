const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Analysis = require('../models/Analysis');

const getDashboard = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const highRiskPatients = await Patient.countDocuments({ riskLevel: 'HIGH' });
    const mediumRiskPatients = await Patient.countDocuments({ riskLevel: 'MEDIUM' });
    const lowRiskPatients = await Patient.countDocuments({ riskLevel: 'LOW' });
    const doctorsAvailable = await Doctor.countDocuments({ availability: 'Available' });

    res.json({
      totalPatients,
      highRiskPatients,
      mediumRiskPatients,
      lowRiskPatients,
      doctorsAvailable
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSymptomAnalytics = async (req, res) => {
  try {
    const patients = await Patient.find();
    const symptomMap = {};

    patients.forEach(p => {
      if (p.symptoms) {
        const symptoms = p.symptoms.split(',').map(s => s.trim().toLowerCase());
        symptoms.forEach(s => {
          if (s) symptomMap[s] = (symptomMap[s] || 0) + 1;
        });
      }
    });

    const analytics = Object.entries(symptomMap).map(([symptom, count]) => ({ symptom, count }));
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRiskDistribution = async (req, res) => {
  try {
    const distribution = await Patient.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, getSymptomAnalytics, getRiskDistribution };
