const express = require('express')
const router = express.Router()
const Category = require('../models/Category')
const { protect, isDosen } = require('../middleware/authMiddleware')

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name email')
      .sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Dosen only)
router.post('/', protect, isDosen, async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: name.trim() })
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' })
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim(),
      createdBy: req.user._id
    })

    const populatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'name email')

    res.status(201).json(populatedCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Dosen only)
router.put('/:id', protect, isDosen, async (req, res) => {
  try {
    const { name, description, isActive } = req.body

    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Check if user is the creator
    if (category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this category' })
    }

    // Check if new name conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id }
      })
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' })
      }
    }

    if (name) category.name = name.trim()
    if (description !== undefined) category.description = description?.trim()
    if (isActive !== undefined) category.isActive = isActive

    await category.save()

    const updatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'name email')

    res.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Dosen only)
router.delete('/:id', protect, isDosen, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Check if user is the creator
    if (category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' })
    }

    // Check if category is being used by any discussions
    const Discussion = require('../models/Discussion')
    const discussionsUsingCategory = await Discussion.countDocuments({ category: req.params.id })

    if (discussionsUsingCategory > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It is being used by ${discussionsUsingCategory} discussion(s)`
      })
    }

    await category.deleteOne()
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
