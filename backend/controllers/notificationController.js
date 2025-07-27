const Notification = require('../models/Notification');

exports.createNotification = async (userId, type, title, message, link) => {
  await Notification.create({ userId, type, title, message, link });
};

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};
