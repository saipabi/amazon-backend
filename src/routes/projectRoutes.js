const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/stats/summary', getProjectStats);
router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;
