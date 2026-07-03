const express = require('express');
const router = express.Router();
const { processMockPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/charge', protect, processMockPayment);

module.exports = router;
