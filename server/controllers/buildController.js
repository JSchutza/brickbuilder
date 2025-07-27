const asyncHandler = require('express-async-handler');
const Build = require('../models/Build');

// @desc    Create a new build
// @route   POST /api/builds
// @access  Private
const createBuild = asyncHandler(async (req, res) => {
  const { name, blocks } = req.body;

  if (req.user.subscription === 'none') {
    res.status(403);
    throw new Error('Subscription required to save new builds');
  }

  const build = await Build.create({
    user: req.user._id,
    name,
    blocks
  });

  if (build) {
    res.status(201).json(build);
  } else {
    res.status(400);
    throw new Error('Invalid build data');
  }
});

// @desc    Get all builds for a user
// @route   GET /api/builds
// @access  Private
const getBuilds = asyncHandler(async (req, res) => {
  const builds = await Build.find({ user: req.user._id });
  res.json(builds);
});

// @desc    Get a single build by ID
// @route   GET /api/builds/:id
// @access  Private
const getBuildById = asyncHandler(async (req, res) => {
  const build = await Build.findById(req.params.id);

  if (build && build.user.toString() === req.user._id.toString()) {
    res.json(build);
  } else {
    res.status(404);
    throw new Error('Build not found or unauthorized');
  }
});

// @desc    Update a build
// @route   PUT /api/builds/:id
// @access  Private
const updateBuild = asyncHandler(async (req, res) => {
  const { name, blocks } = req.body;

  const build = await Build.findById(req.params.id);

  if (build && build.user.toString() === req.user._id.toString()) {
    build.name = name || build.name;
    build.blocks = blocks || build.blocks;

    const updatedBuild = await build.save();
    res.json(updatedBuild);
  } else {
    res.status(404);
    throw new Error('Build not found or unauthorized');
  }
});

// @desc    Delete a build
// @route   DELETE /api/builds/:id
// @access  Private
const deleteBuild = asyncHandler(async (req, res) => {
  const build = await Build.findById(req.params.id);

  if (build && build.user.toString() === req.user._id.toString()) {
    await Build.deleteOne({ _id: build._id });
    res.json({ message: 'Build removed' });
  } else {
    res.status(404);
    throw new Error('Build not found or unauthorized');
  }
});

module.exports = {
  createBuild,
  getBuilds,
  getBuildById,
  updateBuild,
  deleteBuild
}; 