const express = require('express');
const router = express.Router();
const { getDashboard, getSymptomAnalytics, getRiskDistribution } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/symptom-analytics', protect, authorize('admin'), getSymptomAnalytics);
router.get('/risk-distribution', protect, authorize('admin'), getRiskDistribution);

module.exports = router;
