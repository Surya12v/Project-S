const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', isAuthenticated, notificationController.getUserNotifications);
router.post('/mark-read/:id', isAuthenticated, notificationController.markRead);
router.post('/clear', isAuthenticated, notificationController.clearAll);

module.exports = router;
