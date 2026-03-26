const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Only Admins allowed
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.post('/update', inventoryController.updateInventory);

module.exports = router;
