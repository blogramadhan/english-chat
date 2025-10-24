const express = require('express');
const router = express.Router();
const { protect, isDosen } = require('../middleware/auth');
const Discussion = require('../models/Discussion');
const Group = require('../models/Group');
const Message = require('../models/Message');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @route   POST /api/discussions
// @desc    Create new discussion (Dosen only)
// @access  Private/Dosen
router.post('/', protect, isDosen, async (req, res) => {
  try {
    const { title, content, groups, category, tags } = req.body;

    // Support both single group (backward compatibility) and multiple groups
    const groupIds = Array.isArray(groups) ? groups : (groups ? [groups] : []);

    if (groupIds.length === 0) {
      return res.status(400).json({ message: 'At least one group is required' });
    }

    // Verify all groups exist and user is the creator
    for (const groupId of groupIds) {
      const groupDoc = await Group.findById(groupId);
      if (!groupDoc) {
        return res.status(404).json({ message: `Group not found: ${groupId}` });
      }

      if (groupDoc.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: `Not authorized to create discussion for group: ${groupDoc.name}` });
      }
    }

    const discussion = await Discussion.create({
      title,
      content,
      createdBy: req.user._id,
      groups: groupIds,
      group: groupIds[0], // For backward compatibility
      category: category || null,
      tags
    });

    await discussion.populate('createdBy groups group category', '-password');

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/discussions
// @desc    Get all discussions for user's groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let discussions;

    if (req.user.role === 'dosen') {
      // Get discussions created by dosen
      discussions = await Discussion.find({ createdBy: req.user._id })
        .populate('createdBy groups group category', '-password')
        .sort('-createdAt');
    } else {
      // Get groups where mahasiswa is a member
      const groups = await Group.find({ members: req.user._id });
      const groupIds = groups.map(g => g._id);

      // Get discussions for those groups (support both old 'group' and new 'groups' field)
      discussions = await Discussion.find({
        $or: [
          { groups: { $in: groupIds } },
          { group: { $in: groupIds } }
        ]
      })
        .populate('createdBy groups group category', '-password')
        .sort('-createdAt');
    }

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/discussions/:id
// @desc    Get discussion by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('createdBy groups group category', '-password');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/discussions/:id
// @desc    Update discussion (Dosen only)
// @access  Private/Dosen
router.put('/:id', protect, isDosen, async (req, res) => {
  try {
    const { title, content, tags, isActive, groups, category } = req.body;

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If groups are being updated, verify all groups exist and user is the creator
    if (groups) {
      const groupIds = Array.isArray(groups) ? groups : (groups ? [groups] : []);

      if (groupIds.length === 0) {
        return res.status(400).json({ message: 'At least one group is required' });
      }

      for (const groupId of groupIds) {
        const groupDoc = await Group.findById(groupId);
        if (!groupDoc) {
          return res.status(404).json({ message: `Group not found: ${groupId}` });
        }

        if (groupDoc.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: `Not authorized to use group: ${groupDoc.name}` });
        }
      }

      discussion.groups = groupIds;
      discussion.group = groupIds[0]; // For backward compatibility
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.tags = tags || discussion.tags;
    discussion.isActive = isActive !== undefined ? isActive : discussion.isActive;
    if (category !== undefined) discussion.category = category || null;

    const updatedDiscussion = await discussion.save();
    await updatedDiscussion.populate('createdBy groups group category', '-password');

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/discussions/:id
// @desc    Delete discussion (Dosen only)
// @access  Private/Dosen
router.delete('/:id', protect, isDosen, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discussion.deleteOne();
    res.json({ message: 'Discussion removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/discussions/:id/export-pdf
// @desc    Export discussion to PDF (Dosen only)
// @access  Private/Dosen
router.get('/:id/export-pdf', protect, isDosen, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('createdBy groups group', '-password');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get group filter from query parameter
    const groupFilter = req.query.group;

    // Build message query
    const messageQuery = { discussion: req.params.id };

    // If group filter is specified, filter messages by that group
    if (groupFilter && groupFilter !== 'all') {
      messageQuery.group = groupFilter;
    }

    // Get messages for this discussion (filtered by group if specified)
    const messages = await Message.find(messageQuery)
      .populate('sender', 'name email role')
      .sort('createdAt');

    // Helper function to sanitize text for PDF
    const sanitizeText = (text) => {
      if (!text) return '';
      // Replace problematic characters
      return text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[\uFFFD]/g, '') // Remove replacement character
        .trim();
    };

    // Create PDF document with better configuration
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
      compress: false // Disable compression to avoid corruption
    });

    // Set response headers
    const safeFilename = discussion.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=discussion-${safeFilename}.pdf`);

    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDF Document Error:', err);
    });

    // Pipe PDF to response
    const stream = doc.pipe(res);

    stream.on('error', (err) => {
      console.error('PDF Stream Error:', err);
    });

    // Add content to PDF
    // Header - use standard fonts only
    doc.fontSize(20).font('Helvetica').text('Discussion Report', { align: 'center', underline: true });
    doc.moveDown();

    // Discussion Info
    doc.fontSize(14).font('Helvetica').text('Discussion Information', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Title: ${sanitizeText(discussion.title)}`);

    // Show group information based on filter
    if (groupFilter && groupFilter !== 'all') {
      const selectedGroup = discussion.groups?.find(g => g._id.toString() === groupFilter);
      doc.text(`Group: ${sanitizeText(selectedGroup?.name) || 'N/A'}`);
    } else if (discussion.groups && discussion.groups.length > 0) {
      const groupNames = discussion.groups.map(g => sanitizeText(g.name)).join(', ');
      doc.text(`Groups: ${groupNames}`);
    } else {
      doc.text(`Group: ${sanitizeText(discussion.group?.name) || 'N/A'}`);
    }

    doc.text(`Lecturer: ${sanitizeText(discussion.createdBy?.name) || 'N/A'}`);
    doc.text(`Created: ${new Date(discussion.createdAt).toLocaleString('en-US')}`);
    doc.text(`Status: ${discussion.isActive ? 'Active' : 'Inactive'}`);
    doc.moveDown();

    // Discussion Content
    doc.fontSize(12).font('Helvetica').text('Question/Topic:', { underline: true });
    doc.fontSize(10).font('Helvetica').text(sanitizeText(discussion.content) || 'N/A', { align: 'justify' });
    doc.moveDown();

    // Separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Messages
    doc.fontSize(14).font('Helvetica').text('Discussion Messages', { underline: true });
    doc.fontSize(10).font('Helvetica').text(`Total ${messages.length} messages`);
    doc.moveDown();

    for (const [index, message] of messages.entries()) {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }

      // Save left margin position
      const leftMargin = doc.page.margins.left;
      const contentIndent = 20; // Indent for message content

      // Message header with number and sender name
      doc.fontSize(9).font('Helvetica').fillColor('black');
      const senderRole = message.sender?.role === 'dosen' ? '(Lecturer)' : '(Student)';
      const senderName = sanitizeText(message.sender?.name) || 'Unknown';
      doc.text(`${index + 1}. ${senderName} ${senderRole}`, leftMargin, doc.y, { continued: false });

      // Timestamp and edit indicator on new line with indent
      doc.fontSize(8).font('Helvetica').fillColor('gray');
      const timestamp = new Date(message.createdAt).toLocaleString('en-US');
      const editedText = message.isEdited ? ' (edited)' : '';
      doc.text(`${timestamp}${editedText}`, leftMargin + contentIndent);

      // Add spacing before message content
      doc.moveDown(0.5);

      // Message content with indent
      doc.fillColor('black').fontSize(9).font('Helvetica');

      if (message.messageType === 'file') {
        // Handle file attachments
        const fileExt = message.fileName ? path.extname(message.fileName).toLowerCase() : '';
        const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt);

        if (isImage && message.fileUrl) {
          // Try to embed image in PDF
          try {
            const imagePath = path.join(__dirname, '..', message.fileUrl);

            if (fs.existsSync(imagePath)) {
              // Check if we need new page for image
              if (doc.y > 600) {
                doc.addPage();
              }

              doc.text(`[Image: ${sanitizeText(message.fileName)}]`, leftMargin + contentIndent);
              doc.moveDown(0.3);

              // Add image with max width 400px, indented
              const imageX = leftMargin + contentIndent;

              // Wrap image embedding in try-catch
              try {
                doc.image(imagePath, imageX, doc.y, {
                  fit: [380, 280],
                  align: 'left'
                });
                doc.moveDown(0.5);
              } catch (imgError) {
                console.error('Error rendering image in PDF:', imgError);
                doc.text(`[Image cannot be rendered: ${sanitizeText(message.fileName)}]`, leftMargin + contentIndent);
              }

              // Add caption if different from filename
              if (message.content && message.content !== message.fileName) {
                doc.fontSize(8).fillColor('gray');
                doc.text(`Caption: ${sanitizeText(message.content)}`, leftMargin + contentIndent, doc.y, {
                  width: doc.page.width - leftMargin - contentIndent - doc.page.margins.right,
                  align: 'left'
                });
                doc.fillColor('black').fontSize(9);
              }
            } else {
              // File not found, show placeholder
              doc.text(`[Image not found: ${sanitizeText(message.fileName)}]`, leftMargin + contentIndent);
              if (message.content !== message.fileName) {
                doc.text(sanitizeText(message.content), leftMargin + contentIndent);
              }
            }
          } catch (error) {
            console.error('Error embedding image:', error);
            doc.text(`[Image error: ${sanitizeText(message.fileName)}]`, leftMargin + contentIndent);
            if (message.content !== message.fileName) {
              doc.text(sanitizeText(message.content), leftMargin + contentIndent);
            }
          }
        } else {
          // Non-image file (should not happen anymore, but keep for safety)
          doc.text(`[File: ${sanitizeText(message.fileName) || 'attachment'}]`, leftMargin + contentIndent);
          if (message.content && message.content !== message.fileName) {
            doc.text(sanitizeText(message.content), leftMargin + contentIndent);
          }
        }
      } else {
        // Text message - convert emoji to text representation
        let textContent = sanitizeText(message.content);

        // Replace common emoji with text (basic fallback)
        const emojiMap = {
          '😊': ':)',
          '😃': ':D',
          '😄': ':D',
          '😁': ':D',
          '😆': 'XD',
          '😂': 'LOL',
          '🤣': 'ROFL',
          '😢': ':(',
          '😭': 'T_T',
          '😍': '<3',
          '😘': ':*',
          '👍': '[thumbs up]',
          '👎': '[thumbs down]',
          '🙏': '[praying hands]',
          '❤️': '<3',
          '💕': '<3',
          '💖': '<3',
          '✅': '[v]',
          '❌': '[x]',
          '⭐': '[star]',
          '🎉': '[party]',
          '🔥': '[fire]',
          '💯': '[100]',
          '👏': '[clap]',
          '🤔': '[thinking]',
          '😎': 'B)',
          '🙂': ':)',
          '😐': ':|',
          '😑': '-_-'
        };

        // Replace emoji with text representation
        for (const [emoji, text] of Object.entries(emojiMap)) {
          textContent = textContent.split(emoji).join(text);
        }

        // For remaining emoji, replace with unicode description
        textContent = textContent.replace(/[\u{1F600}-\u{1F64F}]/gu, '[emoji]'); // Emoticons
        textContent = textContent.replace(/[\u{1F300}-\u{1F5FF}]/gu, '[emoji]'); // Misc Symbols
        textContent = textContent.replace(/[\u{1F680}-\u{1F6FF}]/gu, '[emoji]'); // Transport
        textContent = textContent.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '[flag]');  // Flags
        textContent = textContent.replace(/[\u{2600}-\u{26FF}]/gu, '[emoji]');   // Misc symbols
        textContent = textContent.replace(/[\u{2700}-\u{27BF}]/gu, '[emoji]');   // Dingbats

        // Write text content with indent
        doc.text(textContent, leftMargin + contentIndent, doc.y, {
          width: doc.page.width - leftMargin - contentIndent - doc.page.margins.right,
          align: 'left'
        });
      }

      doc.moveDown(0.8);
    }

    // Add footer to all pages (must be done before doc.end())
    try {
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Add footer
        doc.fontSize(8).fillColor('gray');
        doc.text(
          `Page ${i - range.start + 1} of ${range.count}`,
          50,
          doc.page.height - 50,
          { align: 'center', lineBreak: false }
        );

        // Restore
        doc.fillColor('black');
      }
    } catch (footerError) {
      console.error('Error adding footer:', footerError);
      // Continue without footer if error
    }

    // Finalize PDF (this will close the stream)
    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);

    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
