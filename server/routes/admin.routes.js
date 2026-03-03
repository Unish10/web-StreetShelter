const express = require('express');
const router = express.Router();
const { User, Owner, DogReport } = require('../models');
const { protect } = require('../middleware/auth.middleware');
const NotificationService = require('../services/notification.service');


const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};




router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});




router.get('/owners/pending', protect, adminOnly, async (req, res) => {
  try {
    const pendingOwners = await Owner.findAll({
      where: { isVerified: false },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(pendingOwners);
  } catch (error) {
    console.error('Error fetching pending owners:', error);
    res.status(500).json({ message: 'Server error fetching pending owners' });
  }
});




router.get('/owners', protect, adminOnly, async (req, res) => {
  try {
    const owners = await Owner.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(owners);
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ message: 'Server error fetching owners' });
  }
});




router.put('/owners/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    owner.isVerified = true;
    await owner.save();

    
    try {
      await NotificationService.createNotification({
        userId: owner.userId,
        type: 'owner_verified',
        title: 'Account Verified! 🎉',
        message: `Congratulations! Your rescue organization "${owner.business_name}" has been verified. You can now respond to rescue reports.`,
        relatedId: owner.id,
        relatedType: 'owner',
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Error sending verification notification:', notifError);
    }

    res.json({
      message: 'Owner verified successfully',
      owner
    });
  } catch (error) {
    console.error('Error verifying owner:', error);
    res.status(500).json({ message: 'Server error verifying owner' });
  }
});




router.put('/owners/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.params.id);

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    
    
    owner.isVerified = false;
    await owner.save();

    res.json({
      message: 'Owner verification rejected',
      owner
    });
  } catch (error) {
    console.error('Error rejecting owner:', error);
    res.status(500).json({ message: 'Server error rejecting owner' });
  }
});




router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});




router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalOwners = await Owner.count();
    const pendingVerifications = await Owner.count({ where: { isVerified: false } });
    const verifiedOwners = await Owner.count({ where: { isVerified: true } });
    const totalReports = await DogReport.count();
    const pendingReports = await DogReport.count({ where: { status: 'pending' } });

    res.json({
      totalUsers,
      totalOwners,
      pendingVerifications,
      verifiedOwners,
      totalReports,
      pendingReports
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
