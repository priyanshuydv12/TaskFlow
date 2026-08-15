const Notification = require('../models/Notification');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get Notifications Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server failed to retrieve notifications',
      error: error.message,
    });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Verify ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notification',
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server failed to update notification status',
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
