const express = require('express');
const { getPayments, recordPayment, updatePaymentStatus } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getPayments);
router.post('/', protect, authorize('TENANT', 'ADMIN'), recordPayment);
router.patch('/:id/status', protect, authorize('OWNER', 'ADMIN'), updatePaymentStatus);

module.exports = router;
