const express = require('express');
const { getRequests, raiseRequest, updateRequestStatus } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getRequests);
router.post('/', protect, authorize('TENANT'), raiseRequest);
router.put('/:id', protect, authorize('OWNER', 'ADMIN'), updateRequestStatus);
router.patch('/:id/status', protect, authorize('OWNER', 'ADMIN'), updateRequestStatus);

module.exports = router;
