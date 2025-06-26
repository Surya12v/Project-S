const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ✅ Route Definitions
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);      // ✅ <--- ADD THIS
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
