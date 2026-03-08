const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

// Role specific routes as requested
router.post('/patient/signup', signup);
router.post('/patient/login', login);

router.post('/doctor/signup', signup);
router.post('/doctor/login', login);

router.post('/staff/signup', signup);
router.post('/staff/login', login);

router.post('/admin/signup', signup);
router.post('/admin/login', login);

module.exports = router;
