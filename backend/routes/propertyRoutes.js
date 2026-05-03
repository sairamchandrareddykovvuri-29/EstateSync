const express = require('express');
const { getProperties, addProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getProperties);
router.post('/', protect, authorize('OWNER', 'ADMIN'), addProperty);
router.put('/:id', protect, authorize('OWNER', 'ADMIN'), updateProperty);
router.delete('/:id', protect, authorize('OWNER', 'ADMIN'), deleteProperty);

module.exports = router;
