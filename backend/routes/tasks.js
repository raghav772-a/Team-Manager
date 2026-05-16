const express = require('express');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (admin) or assigned tasks (member)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Task.find();
    } else {
      query = Task.find({ assignee: req.user._id });
    }

    // Optional filters
    if (req.query.status) query = query.where('status').equals(req.query.status);
    if (req.query.priority) query = query.where('priority').equals(req.query.priority);
    if (req.query.project) query = query.where('project').equals(req.query.project);

    const tasks = await query
      .populate('assignee', 'name initials avatar')
      .populate('project', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics for dashboard
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignee: req.user._id };
    const [total, completed, pending, inProgress, review] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'completed' }),
      Task.countDocuments({ ...filter, status: 'pending' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: 'review' }),
    ]);
    const overdue = await Task.countDocuments({
      ...filter,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    res.json({ success: true, data: { total, completed, pending, inProgress, review, overdue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name initials avatar')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    const task = await Task.create(req.body);
    const populated = await task.populate([
      { path: 'assignee', select: 'name initials avatar' },
      { path: 'project', select: 'name' }
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (admin: full, member: status only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      if (task.assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      // Members can only change status
      const allowed = { status: req.body.status };
      Object.assign(task, allowed);
    } else {
      Object.assign(task, req.body);
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
