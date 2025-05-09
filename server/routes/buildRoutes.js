const express = require('express');
const router = express.Router();
const { 
  createBuild, 
  getBuilds, 
  getBuildById, 
  updateBuild, 
  deleteBuild 
} = require('../controllers/buildController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createBuild)
  .get(protect, getBuilds);

router.route('/:id')
  .get(protect, getBuildById)
  .put(protect, updateBuild)
  .delete(protect, deleteBuild);

module.exports = router; 