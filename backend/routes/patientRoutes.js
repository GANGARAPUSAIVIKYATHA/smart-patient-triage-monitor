const express = require('express');
const router = express.Router();
const { submitHealthData, bookAppointment, getMyRecords } = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/submit-health-data', protect, authorize('patient'), submitHealthData);
router.post('/book-appointment', protect, authorize('patient'), bookAppointment);
router.get('/my-records', protect, authorize('patient'), getMyRecords);

module.exports = router;
