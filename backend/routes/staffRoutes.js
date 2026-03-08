const express = require('express');
const router = express.Router();
const { getPatientQueue, getAppointments, updateAppointment } = require('../controllers/staffController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/patient-queue', protect, authorize('staff', 'admin'), getPatientQueue);
router.get('/appointments', protect, authorize('staff', 'admin'), getAppointments);
router.post('/update-appointment', protect, authorize('staff', 'admin'), updateAppointment);

module.exports = router;
