const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const Faculty = require('../models/Faculty');
const University = require('../models/University');
const { protect, isAdmin } = require('../middleware/auth');

// Get all programs
router.get('/', protect, async (req, res) => {
  try {
    const { facultyId, universityId } = req.query;
    const query = {};

    if (facultyId) {
      query.faculty = facultyId;
    }
    if (universityId) {
      query.university = universityId;
    }

    const programs = await Program.find(query)
      .populate('faculty', 'name code')
      .populate('university', 'name code')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active programs (public - for registration)
router.get('/active', async (req, res) => {
  try {
    const { facultyId, universityId } = req.query;
    const query = { isActive: true };

    if (facultyId) {
      query.faculty = facultyId;
    }
    if (universityId) {
      query.university = universityId;
    }

    const programs = await Program.find(query)
      .select('name description level faculty university')
      .populate('faculty', 'name')
      .populate('university', 'name code')
      .sort({ name: 1 });

    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get program by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('faculty', 'name code')
      .populate('university', 'name code')
      .populate('createdBy', 'name email');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create program (admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, level, faculty, university } = req.body;

    // Validate required fields
    if (!name || !level || !faculty || !university) {
      return res.status(400).json({ message: 'Name, level, faculty, and university are required' });
    }

    // Check if req.user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if faculty exists and belongs to the university
    const facultyExists = await Faculty.findById(faculty);
    if (!facultyExists) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (facultyExists.university.toString() !== university) {
      return res.status(400).json({ message: 'Faculty does not belong to the specified university' });
    }

    // Check if university exists
    const universityExists = await University.findById(university);
    if (!universityExists) {
      return res.status(404).json({ message: 'University not found' });
    }

    const program = new Program({
      name,
      description,
      level,
      faculty,
      university,
      createdBy: req.user._id
    });

    await program.save();
    await program.populate('faculty', 'name');
    await program.populate('university', 'name code');
    await program.populate('createdBy', 'name email');

    res.status(201).json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Failed to save program', error: error.message });
  }
});

// Update program (admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, level, faculty, university, isActive } = req.body;

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if faculty exists and belongs to the university if being changed
    if (faculty || university) {
      const targetFaculty = faculty || program.faculty;
      const targetUniversity = university || program.university;

      const facultyExists = await Faculty.findById(targetFaculty);
      if (!facultyExists) {
        return res.status(404).json({ message: 'Faculty not found' });
      }

      if (facultyExists.university.toString() !== targetUniversity.toString()) {
        return res.status(400).json({ message: 'Faculty does not belong to the specified university' });
      }

      const universityExists = await University.findById(targetUniversity);
      if (!universityExists) {
        return res.status(404).json({ message: 'University not found' });
      }
    }

    program.name = name || program.name;
    program.description = description !== undefined ? description : program.description;
    program.level = level || program.level;
    program.faculty = faculty || program.faculty;
    program.university = university || program.university;
    program.isActive = isActive !== undefined ? isActive : program.isActive;

    await program.save();
    await program.populate('faculty', 'name');
    await program.populate('university', 'name code');
    await program.populate('createdBy', 'name email');

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete program (admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Optional: Check if program is being used by users
    // Uncomment when User model is updated
    // const User = require('../models/User');
    // const userCount = await User.countDocuments({ program: req.params.id });
    // if (userCount > 0) {
    //   return res.status(400).json({
    //     message: `Cannot delete program. It has ${userCount} users associated with it.`
    //   });
    // }

    await Program.findByIdAndDelete(req.params.id);
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
