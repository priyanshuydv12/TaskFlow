const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user'],
    },
    message: {
      type: String,
      required: [true, 'Please add a notification message'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify the notification type'],
      enum: {
        values: ['task-assigned', 'deadline-approaching', 'status-changed'],
        message: '{VALUE} is not a valid notification type',
      },
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
