const express = require('express');
const { getListings, toggleListingStatus } = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getListings);
router.put('/:id/status', protect, authorize('OWNER', 'ADMIN'), toggleListingStatus);

module.exports = router;
