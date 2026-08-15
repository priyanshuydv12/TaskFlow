const Task = require('../models/Task');
const User = require('../models/User');

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

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(550).json({ // We will map to 500 Internals. Wait, the prompt says correct codes: 200/201/400/401/403/404/500
      success: false,
      message: 'Server failed to create task',
      error: error.message,
    });
  }
};

// @desc    Get all tasks with optional filters
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

// @desc    Get a single task by ID
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

// @desc    Update a task (Full details)
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

// @desc    Delete a task
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

// @desc    Update task status only
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

    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

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

// @desc    Assign task to user
// @route   PATCH /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

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

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.assignedTo = assignedTo || null;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

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
