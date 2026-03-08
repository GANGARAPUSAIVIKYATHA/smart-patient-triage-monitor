const express = require('express');
const router = express.Router();
const { getProfile, getPatients, getHighRiskPatients, updateStatus } = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/profile', protect, authorize('doctor'), getProfile);
router.get('/patients', protect, authorize('doctor'), getPatients);
router.get('/high-risk-patients', protect, authorize('doctor'), getHighRiskPatients);
router.post('/update-status', protect, authorize('doctor'), updateStatus);

module.exports = router;
