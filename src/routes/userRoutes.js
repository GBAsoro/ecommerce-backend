const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { changePasswordSchema } = require('../validators/authValidator');

// All routes require authentication
router.use(protect);

// User routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), userController.changePassword);

// Admin only routes
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.get('/:id', restrictTo('admin'), userController.getUserById);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

module.exports = router;
