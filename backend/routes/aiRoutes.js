const express = require('express');
const router = express.Router();
const { analyzeTriage } = require('../ai/triageService');
const { protect } = require('../middlewares/authMiddleware');

router.post('/analyze', protect, (req, res) => {
  const result = analyzeTriage(req.body);
  res.json(result);
});

module.exports = router;
