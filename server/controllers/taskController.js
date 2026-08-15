const Task = require('../models/Task');
const User = require('../models/User');
const { notifyTaskCreated, notifyTaskUpdated, notifyTaskDeleted } = require('../sockets/socketHandler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, deadline, assignedTo } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, deadline)',
      });
    }

    // Verify if assignedTo is a valid user if provided
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'todo',
      deadline,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    notifyTaskCreated(populatedTask);

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server failed to create task',
      error: error.message,
    });
  }
};

// @desc    Get all tasks with optional filters (ownership checked)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const query = {};

    // Dynamic filtering via query parameters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    // RBAC ownership check: Non-admins can only list tasks they created or are assigned to
    if (req.user.role !== 'admin') {
      const userFilter = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
      // If query already has some conditions, we combine them via $and
      if (Object.keys(query).length > 0) {
        query.$and = [
          { $or: userFilter },
          { ...query }
        ];
        // Clean out root level values that we nested in $and
        delete query.status;
        delete query.priority;
        delete query.assignedTo;
        delete query.createdBy;
      } else {
        query.$or = userFilter;
      }
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Get Tasks Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server failed to retrieve tasks',
      error: error.message,
    });
  }
};

// @desc    Get a single task by ID (ownership checked)
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // RBAC check: Only admin, creator, or assignee can view
    const isCreator = task.createdBy._id.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get Task By ID Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Task ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server failed to retrieve task details',
      error: error.message,
    });
  }
};

// @desc    Update a task (Creator or Admin only)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, deadline, assignedTo } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // RBAC check: Only admin or creator can perform full updates
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task (creator or admin only)',
      });
    }

    // Verify assignedTo exists
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found',
        });
      }
    }

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority !== undefined ? priority : task.priority;
    task.status = status !== undefined ? status : task.status;
    task.deadline = deadline !== undefined ? deadline : task.deadline;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    notifyTaskUpdated(populatedTask);

    res.status(200).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Update Task Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server failed to update task',
      error: error.message,
    });
  }
};

// @desc    Delete a task (Creator or Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // RBAC check: Only admin or creator can delete
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task (creator or admin only)',
      });
    }

    notifyTaskDeleted(task._id, task.createdBy, task.assignedTo);

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Task ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server failed to delete task',
      error: error.message,
    });
  }
};

// @desc    Update task status only (Creator, Assignee, or Admin)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status value',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // RBAC check: Creator, Assignee, or Admin can update status
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update status of this task',
      });
    }

    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    notifyTaskUpdated(populatedTask);

    res.status(200).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Patch Status Error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server failed to update task status',
      error: error.message,
    });
  }
};

// @desc    Assign task to user (Creator or Admin only)
// @route   PATCH /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // RBAC check: Only creator or admin can update assignment
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign users to this task (creator or admin only)',
      });
    }

    // Notice assignedTo can be null/empty to unassign
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found',
        });
      }
    }

    task.assignedTo = assignedTo || null;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    notifyTaskUpdated(populatedTask);

    res.status(200).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Patch Assign Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid User or Task ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server failed to assign task',
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
};
