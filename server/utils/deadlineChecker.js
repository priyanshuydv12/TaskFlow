const Task = require('../models/Task');
const Notification = require('../models/Notification');

const checkDeadlines = async (io) => {
  if (!io) return;

  console.log('Background Cron: Checking task deadlines...');
  try {
    const tasks = await Task.find({ status: { $ne: 'completed' } });
    const now = new Date();

    for (const task of tasks) {
      const deadline = new Date(task.deadline);
      const diffMs = deadline - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const recipientId = task.assignedTo || task.createdBy;

      if (!recipientId) continue;

      let message = '';
      
      // Determine state
      if (diffHours < 0) {
        // Overdue task
        message = `Task "${task.title}" is overdue!`;
      } else if (diffHours <= 24) {
        // Due today (less than 24 hours remaining)
        message = `Task "${task.title}" is due today!`;
      }

      if (message) {
        // Check for recent duplicate notifications to avoid spamming the user on hourly checks
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const duplicate = await Notification.findOne({
          user: recipientId,
          type: 'deadline-approaching',
          message,
          createdAt: { $gte: twelveHoursAgo }
        });

        if (!duplicate) {
          const notification = await Notification.create({
            user: recipientId,
            message,
            type: 'deadline-approaching',
            read: false
          });

          // Emit notification live via Socket.io
          io.to(`user_${recipientId.toString()}`).emit('notification:received', notification);
          console.log(`Deadline notification sent to user ${recipientId}: "${message}"`);
        }
      }
    }
  } catch (error) {
    console.error('Deadline Checker Error:', error.message);
  }
};

module.exports = {
  checkDeadlines,
};
