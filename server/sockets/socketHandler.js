const jwt = require('jsonwebtoken');
const User = require('../models/User');

let ioInstance = null;

const initSockets = (io) => {
  ioInstance = io;

  // Handshake authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user profile
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Bind user data to socket connection
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const userRoom = `user_${userId}`;
    
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.name}, ID: ${userId})`);

    // Join user-specific room
    socket.join(userRoom);

    // Join role-specific room if admin
    if (socket.user.role === 'admin') {
      socket.join('role_admin');
      console.log(`Admin joined role_admin room: ${socket.user.name}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.name})`);
    });
  });
};

const getIo = () => ioInstance;

// Helper broadcasting utilities
const notifyTaskCreated = (task) => {
  if (!ioInstance) return;
  const creatorId = task.createdBy._id || task.createdBy;
  const assigneeId = task.assignedTo?._id || task.assignedTo;

  const target = ioInstance.to(`user_${creatorId.toString()}`).to('role_admin');
  if (assigneeId) {
    target.to(`user_${assigneeId.toString()}`);
  }
  
  target.emit('task:created', task);
  console.log(`Socket broadcast: task:created emitted for task ${task._id}`);
};

const notifyTaskUpdated = (task) => {
  if (!ioInstance) return;
  const creatorId = task.createdBy._id || task.createdBy;
  const assigneeId = task.assignedTo?._id || task.assignedTo;

  const target = ioInstance.to(`user_${creatorId.toString()}`).to('role_admin');
  if (assigneeId) {
    target.to(`user_${assigneeId.toString()}`);
  }

  target.emit('task:updated', task);
  console.log(`Socket broadcast: task:updated emitted for task ${task._id}`);
};

const notifyTaskDeleted = (taskId, creatorId, assigneeId) => {
  if (!ioInstance) return;
  
  const target = ioInstance.to(`user_${creatorId.toString()}`).to('role_admin');
  if (assigneeId) {
    target.to(`user_${assigneeId.toString()}`);
  }

  target.emit('task:deleted', { taskId });
  console.log(`Socket broadcast: task:deleted emitted for task ${taskId}`);
};

module.exports = {
  initSockets,
  getIo,
  notifyTaskCreated,
  notifyTaskUpdated,
  notifyTaskDeleted,
};
