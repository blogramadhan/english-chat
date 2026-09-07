const fs = require('fs');
const Discussion = require('../models/Discussion');
const Group = require('../models/Group');

/**
 * Resolve a user's relationship to a discussion.
 *
 * Returns { discussion, isOwner, isMember, group } where `group` is the _id of
 * the group the user belongs to in this discussion (mahasiswa) or null.
 * Returns null when the discussion does not exist.
 */
const resolveAccess = async (discussionId, user) => {
  const discussion = await Discussion.findById(discussionId).populate('groups');
  if (!discussion) return null;

  // A dosen owns the discussion when they created it or collaborate on it.
  const isOwner =
    user.role === 'dosen' &&
    (discussion.createdBy.toString() === user._id.toString() ||
      (discussion.collaborators || []).some(
        (c) => c.toString() === user._id.toString()
      ));

  // A mahasiswa takes part when they are a member of one of its groups.
  let group = null;
  for (const g of discussion.groups || []) {
    const members = g.members || [];
    if (members.some((m) => m.toString() === user._id.toString())) {
      group = g._id;
      break;
    }
  }

  return { discussion, isOwner, isMember: Boolean(group), group };
};

/**
 * Guard a discussion-scoped route. Populates req.discussionAccess.
 * Reads the discussion id from req.params[param] or req.body[param].
 */
// Multipart bodies are only readable after multer has written the file, so on
// an upload this guard necessarily runs second. Drop the orphaned file rather
// than leaving it on disk for a caller who turned out to have no access.
const discardUpload = (req) => {
  if (!req.file || !req.file.path) return;
  fs.unlink(req.file.path, (err) => {
    if (err) console.error('Failed to remove rejected upload:', err.message);
  });
};

const requireDiscussionAccess = (param = 'discussionId') => async (req, res, next) => {
  try {
    const id = req.params[param] || req.body[param] || req.body.discussion;
    if (!id) {
      discardUpload(req);
      return res.status(400).json({ message: 'Discussion id is required' });
    }

    const access = await resolveAccess(id, req.user);
    if (!access) {
      discardUpload(req);
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Admins do not take part in discussions.
    if (!access.isOwner && !access.isMember) {
      discardUpload(req);
      return res
        .status(403)
        .json({ message: 'You do not have access to this discussion' });
    }

    req.discussionAccess = access;
    next();
  } catch (error) {
    // A malformed id casts badly; treat it as not found rather than a 500.
    if (error.name === 'CastError') {
      discardUpload(req);
      return res.status(404).json({ message: 'Discussion not found' });
    }
    discardUpload(req);
    next(error);
  }
};

/** True when the user may see a group's contents (member, or owning dosen). */
const canSeeGroup = async (groupId, user) => {
  const group = await Group.findById(groupId);
  if (!group) return { group: null, allowed: false };

  if (user.role === 'admin') return { group, allowed: true };
  if (group.createdBy.toString() === user._id.toString()) return { group, allowed: true };
  const allowed = (group.members || []).some(
    (m) => m.toString() === user._id.toString()
  );
  return { group, allowed };
};

module.exports = { resolveAccess, requireDiscussionAccess, canSeeGroup };
