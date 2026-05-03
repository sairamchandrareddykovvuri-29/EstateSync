const express = require('express');
const { getLeases, createLease, updateLeaseStatus } = require('../controllers/leaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getLeases);
router.post('/', protect, authorize('OWNER', 'ADMIN'), createLease);
router.put('/:id', protect, authorize('OWNER', 'ADMIN'), updateLeaseStatus);
router.patch('/:id/end', protect, authorize('OWNER', 'ADMIN'), updateLeaseStatus);

module.exports = router;
