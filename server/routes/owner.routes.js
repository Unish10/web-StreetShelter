const express = require('express');
const router = express.Router();
const { Owner, User } = require('../models');
const { protect } = require('../middleware/auth.middleware');
const NotificationService = require('../services/notification.service');




router.post('/register', protect, async (req, res) => {
  try {
    const { business_name, id_number, ownership_type, description, capacity } = req.body;

    
    if (!business_name || !id_number || !ownership_type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    
    const existingOwner = await Owner.findOne({ where: { userId: req.user.id } });
    if (existingOwner) {
      return res.status(400).json({ message: 'Owner profile already exists' });
    }

    
    const idExists = await Owner.findOne({ where: { id_number: id_number.toUpperCase() } });
    if (idExists) {
      return res.status(400).json({ message: 'ID number already registered' });
    }

    const owner = await Owner.create({
      userId: req.user.id,
      business_name,
      id_number: id_number.toUpperCase(),
      ownership_type,
      description,
      capacity
    });

    
    await User.update(
      { role: 'owner' },
      { where: { id: req.user.id } }
    );

    
    try {
      await NotificationService.notifyAdmins({
        type: 'owner_registered',
        title: 'New Owner Registration',
        message: `${business_name} has registered as a rescue owner and needs verification. ID: ${id_number}`,
        relatedId: owner.id,
        relatedType: 'owner',
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Error sending owner registration notification:', notifError);
    }

    res.status(201).json(owner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error registering owner' });
  }
});




router.get('/profile', protect, async (req, res) => {
  try {
    const owner = await Owner.findOne({ 
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'email']
      }]
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner profile not found' });
    }

    res.json(owner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching owner profile' });
  }
});




router.put('/profile', protect, async (req, res) => {
  try {
    const owner = await Owner.findOne({ where: { userId: req.user.id } });

    if (!owner) {
      return res.status(404).json({ message: 'Owner profile not found' });
    }

    const { business_name, ownership_type, description, capacity } = req.body;

    const updateData = {};
    if (business_name) updateData.business_name = business_name;
    if (ownership_type) updateData.ownership_type = ownership_type;
    if (description !== undefined) updateData.description = description;
    if (capacity !== undefined) updateData.capacity = capacity;

    await owner.update(updateData);
    res.json(owner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating owner profile' });
  }
});

module.exports = router;
