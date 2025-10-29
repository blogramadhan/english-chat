const express = require('express');
const router = express.Router();
const University = require('../models/University');
const Faculty = require('../models/Faculty');
const { protect, isAdmin } = require('../middleware/auth');

// Get all universities
router.get('/', protect, async (req, res) => {
  try {
    const universities = await University.find()
      .populate('createdBy', 'name email')
      .sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active universities only
router.get('/active', protect, async (req, res) => {
  try {
    const universities = await University.find({ isActive: true })
      .sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get university by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const university = await University.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json(university);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create university (admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, code, description, address } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    // Check if req.user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if university with same code already exists
    const existingUniversity = await University.findOne({ code });
    if (existingUniversity) {
      return res.status(400).json({ message: 'University with this code already exists' });
    }

    const university = new University({
      name,
      code,
      description,
      address,
      createdBy: req.user._id
    });

    await university.save();
    await university.populate('createdBy', 'name email');

    res.status(201).json(university);
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ message: 'Failed to save university', error: error.message });
  }
});

// Update university (admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, code, description, address, isActive } = req.body;

    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Check if code is being changed and if it conflicts
    if (code && code !== university.code) {
      const existingUniversity = await University.findOne({ code });
      if (existingUniversity) {
        return res.status(400).json({ message: 'University with this code already exists' });
      }
    }

    university.name = name || university.name;
    university.code = code || university.code;
    university.description = description !== undefined ? description : university.description;
    university.address = address !== undefined ? address : university.address;
    university.isActive = isActive !== undefined ? isActive : university.isActive;

    await university.save();
    await university.populate('createdBy', 'name email');

    res.json(university);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete university (admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Check if university has faculties
    const facultyCount = await Faculty.countDocuments({ university: req.params.id });
    if (facultyCount > 0) {
      return res.status(400).json({
        message: `Cannot delete university. It has ${facultyCount} faculties associated with it.`
      });
    }

    await University.findByIdAndDelete(req.params.id);
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
