const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// In-memory fallback tasks for seamless local & demo evaluation
let mockTasks = [
  {
    _id: 'task_demo_1',
    title: 'Configure MongoDB Atlas Production Cluster',
    description: 'Set up replication, automated backups, and IP allowlist.',
    project: 'proj_demo_1',
    status: 'Done',
    priority: 'High',
    assignee: 'Rajesh Sharma',
    dueDate: new Date('2026-09-25'),
    tags: ['Database', 'DevOps'],
    createdAt: new Date(),
  },
  {
    _id: 'task_demo_2',
    title: 'Implement JWT Refresh Tokens & Rate Limiting',
    description: 'Enhance API authentication security with Redis blacklist token support.',
    project: 'proj_demo_1',
    status: 'In Progress',
    priority: 'High',
    assignee: 'Priya Verma',
    dueDate: new Date('2026-09-28'),
    tags: ['Security', 'Backend'],
    createdAt: new Date(),
  },
  {
    _id: 'task_demo_3',
    title: 'Design Project Kanban Board Components',
    description: 'Build drag-and-drop columns for To Do, In Progress, and Completed states.',
    project: 'proj_demo_2',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Amit Patel',
    dueDate: new Date('2026-10-02'),
    tags: ['Frontend', 'UI/UX'],
    createdAt: new Date(),
  },
  {
    _id: 'task_demo_4',
    title: 'Write Jest & Supertest Integration Test Suite',
    description: 'Ensure 100% test pass rate for all Project and Task CRUD endpoints.',
    project: 'proj_demo_1',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Rajesh Sharma',
    dueDate: new Date('2026-10-05'),
    tags: ['QA', 'Testing'],
    createdAt: new Date(),
  },
  {
    _id: 'task_demo_5',
    title: 'Launch Influencer & Developer Beta Preview',
    description: 'Send early onboarding invites and gather usability feedback.',
    project: 'proj_demo_3',
    status: 'Done',
    priority: 'Low',
    assignee: 'Sneha Reddy',
    dueDate: new Date('2026-09-15'),
    tags: ['Marketing'],
    createdAt: new Date(),
  },
];

// Helper to get effective user ID
const getUserId = (req) => {
  return req.user && req.user.id ? req.user.id.toString() : 'default_user';
};

// @desc Create a task
// @route POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, project, status, priority, assignee, dueDate, tags } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Task title and project ID are required' });
    }

    const userId = getUserId(req);

    if (isDbConnected()) {
      try {
        const task = await Task.create({
          title,
          description: description || '',
          project,
          status: status || 'To Do',
          priority: priority || 'Medium',
          assignee: assignee || 'Unassigned',
          dueDate: dueDate || null,
          tags: Array.isArray(tags) ? tags : [],
          createdBy: userId,
        });

        return res.status(201).json(task);
      } catch (err) {
        // Fallback
      }
    }

    const newMock = {
      _id: `task_${Date.now()}`,
      title,
      description: description || '',
      project,
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignee: assignee || 'Unassigned',
      dueDate: dueDate || null,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: userId,
      createdAt: new Date(),
    };
    mockTasks.unshift(newMock);
    return res.status(201).json(newMock);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// @desc Get tasks with filtering, search & sorting
// @route GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignee, search, sort } = req.query;

    if (isDbConnected()) {
      try {
        let query = {};
        if (project && project !== 'All') query.project = project;
        if (status && status !== 'All') query.status = status;
        if (priority && priority !== 'All') query.priority = priority;
        if (assignee && assignee !== 'All') query.assignee = assignee;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { assignee: { $regex: search, $options: 'i' } },
          ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'dueDate') sortOption = { dueDate: 1 };
        if (sort === 'priority') sortOption = { priority: 1 };
        if (sort === 'title') sortOption = { title: 1 };

        const tasks = await Task.find(query).populate('project', 'title category').sort(sortOption);
        return res.json(tasks);
      } catch (err) {
        // Fallback
      }
    }

    let filtered = [...mockTasks];
    if (project && project !== 'All') filtered = filtered.filter((t) => t.project === project);
    if (status && status !== 'All') filtered = filtered.filter((t) => t.status === status);
    if (priority && priority !== 'All') filtered = filtered.filter((t) => t.priority === priority);
    if (assignee && assignee !== 'All') filtered = filtered.filter((t) => t.assignee === assignee);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          t.assignee.toLowerCase().includes(s)
      );
    }
    if (sort === 'dueDate') {
      filtered.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
    }
    return res.json(filtered);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// @desc Get single task
// @route GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const task = await Task.findById(id).populate('project', 'title');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        return res.json(task);
      } catch (err) {
        // Fallback
      }
    }

    const t = mockTasks.find((x) => x._id === id);
    if (!t) return res.status(404).json({ message: 'Task not found' });
    return res.json(t);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving task', error: error.message });
  }
};

// @desc Update task
// @route PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        Object.assign(task, updates);
        await task.save();
        return res.json(task);
      } catch (err) {
        // Fallback
      }
    }

    const idx = mockTasks.findIndex((t) => t._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Task not found' });
    mockTasks[idx] = { ...mockTasks[idx], ...updates, updatedAt: new Date() };
    return res.json(mockTasks[idx]);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.deleteOne();
        return res.json({ message: 'Task removed successfully' });
      } catch (err) {
        // Fallback
      }
    }

    mockTasks = mockTasks.filter((t) => t._id !== id);
    return res.json({ message: 'Task removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
