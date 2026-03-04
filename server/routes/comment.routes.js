const express = require('express');
const router = express.Router();
const { Comment, User, DogReport } = require('../models');
const { protect } = require('../middleware/auth.middleware');

// Get all comments for a specific report
router.get('/report/:reportId', protect, async (req, res) => {
  try {
    const { reportId } = req.params;

    const comments = await Comment.findAll({
      where: { reportId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Add a comment to a report
router.post('/report/:reportId', protect, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { message, commentType = 'comment', metadata = null } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    // Verify report exists
    const report = await DogReport.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const comment = await Comment.create({
      reportId,
      userId: req.user.id,
      message: message.trim(),
      commentType,
      metadata
    });

    // Fetch the comment with user details
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Update a comment (only by owner)
router.put('/:commentId', protect, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only the comment owner can update it
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.message = message.trim();
    await comment.save();

    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete a comment (only by owner or admin)
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only the comment owner or admin can delete it
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router;
