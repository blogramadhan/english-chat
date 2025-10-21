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
    const { title, content, group, tags } = req.body;

    // Verify group exists and user is the creator
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (groupDoc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create discussion for this group' });
    }

    const discussion = await Discussion.create({
      title,
      content,
      createdBy: req.user._id,
      group,
      tags
    });

    await discussion.populate('createdBy group', '-password');

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
        .populate('createdBy group', '-password')
        .sort('-createdAt');
    } else {
      // Get groups where mahasiswa is a member
      const groups = await Group.find({ members: req.user._id });
      const groupIds = groups.map(g => g._id);

      // Get discussions for those groups
      discussions = await Discussion.find({ group: { $in: groupIds } })
        .populate('createdBy group', '-password')
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
      .populate('createdBy group', '-password');

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
    const { title, content, tags, isActive } = req.body;

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.tags = tags || discussion.tags;
    discussion.isActive = isActive !== undefined ? isActive : discussion.isActive;

    const updatedDiscussion = await discussion.save();
    await updatedDiscussion.populate('createdBy group', '-password');

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
      .populate('createdBy group', '-password');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all messages for this discussion
    const messages = await Message.find({ discussion: req.params.id })
      .populate('sender', 'name email role')
      .sort('createdAt');

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=diskusi-${discussion.title.replace(/\s+/g, '-')}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Laporan Diskusi', { align: 'center' });
    doc.moveDown();

    // Discussion Info
    doc.fontSize(14).font('Helvetica-Bold').text('Informasi Diskusi');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Judul: ${discussion.title}`);
    doc.text(`Grup: ${discussion.group?.name || 'N/A'}`);
    doc.text(`Dosen: ${discussion.createdBy?.name || 'N/A'}`);
    doc.text(`Dibuat: ${new Date(discussion.createdAt).toLocaleString('id-ID')}`);
    doc.text(`Status: ${discussion.isActive ? 'Aktif' : 'Nonaktif'}`);
    doc.moveDown();

    // Discussion Content
    doc.fontSize(12).font('Helvetica-Bold').text('Pertanyaan/Topik:');
    doc.fontSize(10).font('Helvetica').text(discussion.content, { align: 'justify' });
    doc.moveDown();

    // Separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Messages
    doc.fontSize(14).font('Helvetica-Bold').text('Pesan Diskusi');
    doc.fontSize(10).font('Helvetica').text(`Total ${messages.length} pesan`);
    doc.moveDown();

    for (const [index, message] of messages.entries()) {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }

      // Message header
      doc.fontSize(9).font('Helvetica-Bold');
      const senderRole = message.sender?.role === 'dosen' ? '(Dosen)' : '(Mahasiswa)';
      doc.text(`${index + 1}. ${message.sender?.name || 'Unknown'} ${senderRole}`);

      doc.fontSize(8).font('Helvetica').fillColor('gray');
      doc.text(new Date(message.createdAt).toLocaleString('id-ID'), { continued: true });

      if (message.isEdited) {
        doc.text(' (edited)');
      } else {
        doc.text('');
      }

      // Message content
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

              doc.text(`[Gambar: ${message.fileName}]`, { align: 'left' });
              doc.moveDown(0.3);

              // Add image with max width 400px
              doc.image(imagePath, {
                fit: [400, 300],
                align: 'center'
              });

              doc.moveDown(0.5);

              // Add caption if different from filename
              if (message.content && message.content !== message.fileName) {
                doc.fontSize(8).fillColor('gray');
                doc.text(`Keterangan: ${message.content}`, { align: 'justify' });
                doc.fillColor('black').fontSize(9);
              }
            } else {
              // File not found, show placeholder
              doc.text(`[Gambar tidak ditemukan: ${message.fileName}]`);
              if (message.content !== message.fileName) {
                doc.text(message.content);
              }
            }
          } catch (error) {
            console.error('Error embedding image:', error);
            doc.text(`[Gambar: ${message.fileName}]`);
            if (message.content !== message.fileName) {
              doc.text(message.content);
            }
          }
        } else {
          // Non-image file
          doc.text(`[File: ${message.fileName || 'attachment'}]`);
          if (message.content && message.content !== message.fileName) {
            doc.text(message.content);
          }
        }
      } else {
        // Text message - convert emoji to text representation
        let textContent = message.content;

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

        doc.text(textContent, { align: 'justify' });
      }

      doc.moveDown(0.5);
    }

    // Footer
    doc.fontSize(8).fillColor('gray');
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.text(
        `Halaman ${i + 1} dari ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
