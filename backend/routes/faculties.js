const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Program = require('../models/Program');
const University = require('../models/University');
const { protect, isAdmin } = require('../middleware/auth');

// Get all faculties
router.get('/', protect, async (req, res) => {
  try {
    const { universityId } = req.query;
    const query = universityId ? { university: universityId } : {};

    const faculties = await Faculty.find(query)
      .populate('university', 'name code')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active faculties
router.get('/active', protect, async (req, res) => {
  try {
    const { universityId } = req.query;
    const query = { isActive: true };
    if (universityId) {
      query.university = universityId;
    }

    const faculties = await Faculty.find(query)
      .populate('university', 'name code')
      .sort({ name: 1 });

    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get faculty by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('university', 'name code')
      .populate('createdBy', 'name email');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create faculty (admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, code, description, university } = req.body;

    // Validate required fields
    if (!name || !code || !university) {
      return res.status(400).json({ message: 'Name, code, and university are required' });
    }

    // Check if req.user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if university exists
    const universityExists = await University.findById(university);
    if (!universityExists) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Check if faculty with same code exists in this university
    const existingFaculty = await Faculty.findOne({ code, university });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this code already exists in this university' });
    }

    const faculty = new Faculty({
      name,
      code,
      description,
      university,
      createdBy: req.user._id
    });

    await faculty.save();
    await faculty.populate('university', 'name code');
    await faculty.populate('createdBy', 'name email');

    res.status(201).json(faculty);
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ message: 'Failed to save faculty', error: error.message });
  }
});

// Update faculty (admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, code, description, university, isActive } = req.body;

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if university exists if being changed
    if (university && university !== faculty.university.toString()) {
      const universityExists = await University.findById(university);
      if (!universityExists) {
        return res.status(404).json({ message: 'University not found' });
      }
    }

    // Check if code is being changed and if it conflicts
    const targetUniversity = university || faculty.university;
    if (code && (code !== faculty.code || targetUniversity !== faculty.university.toString())) {
      const existingFaculty = await Faculty.findOne({
        code,
        university: targetUniversity,
        _id: { $ne: req.params.id }
      });
      if (existingFaculty) {
        return res.status(400).json({ message: 'Faculty with this code already exists in this university' });
      }
    }

    faculty.name = name || faculty.name;
    faculty.code = code || faculty.code;
    faculty.description = description !== undefined ? description : faculty.description;
    faculty.university = university || faculty.university;
    faculty.isActive = isActive !== undefined ? isActive : faculty.isActive;

    await faculty.save();
    await faculty.populate('university', 'name code');
    await faculty.populate('createdBy', 'name email');

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete faculty (admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if faculty has programs
    const programCount = await Program.countDocuments({ faculty: req.params.id });
    if (programCount > 0) {
      return res.status(400).json({
        message: `Cannot delete faculty. It has ${programCount} programs associated with it.`
      });
    }

    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
