const express = require('express');
const router = express.Router();
const { DogReport, User } = require('../models');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const NotificationService = require('../services/notification.service');




router.get('/', protect, async (req, res) => {
  try {
    const reports = await DogReport.findAll({
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dog reports' });
  }
});




router.get('/:id', protect, async (req, res) => {
  try {
    const report = await DogReport.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['username', 'email']
      }]
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Dog report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dog report' });
  }
});




router.post('/', protect, upload.array('images', 20), async (req, res) => {
  try {
    const { location, description, additionalNotes, latitude, longitude, reporter_name, reporter_email, reporter_phone } = req.body;

    console.log('Creating report with data:', {
      location,
      description,
      latitude,
      longitude,
      reporter_name,
      reporter_email,
      reporter_phone,
      filesCount: req.files ? req.files.length : 0,
      user: req.user.username
    });

    if (!location || !description) {
      return res.status(400).json({ message: 'Please provide location and description' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    const imageUrl = JSON.stringify(imageUrls);  

    const report = await DogReport.create({
      location,
      description,
      imageUrl,  
      additionalNotes,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      reporter_name: reporter_name || req.user.username,
      reporter_email: reporter_email || req.user.email,
      reporter_phone: reporter_phone || null,
      reportedBy: req.user.id
    });

    console.log('Created report:', report.toJSON());

    
    try {
      
      await NotificationService.notifyAdmins({
        type: 'report_submitted',
        title: 'New Dog Report Submitted',
        message: `A new dog report has been submitted at ${location}. Reported by: ${reporter_name || req.user.username}`,
        relatedId: report.id,
        relatedType: 'report',
        priority: 'high'
      });

      
      await NotificationService.notifyVerifiedOwners({
        type: 'report_submitted',
        title: 'New Rescue Opportunity',
        message: `A dog needs rescue at ${location}. ${description.substring(0, 100)}...`,
        relatedId: report.id,
        relatedType: 'report',
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Error sending notifications:', notifError);
      
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error creating dog report' });
  }
});




router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const report = await DogReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Dog report not found' });
    }

    
    if (report.reportedBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    const { location, description, additionalNotes, status } = req.body;

    const updateData = {};
    const oldStatus = report.status;
    if (location) updateData.location = location;
    if (description) updateData.description = description;
    if (additionalNotes !== undefined) updateData.additionalNotes = additionalNotes;
    
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    
    if (status && (req.user.role === 'admin' || req.user.role === 'owner')) {
      updateData.status = status;
    }

    await report.update(updateData);

    
    if (status && status !== oldStatus) {
      try {
        if (status === 'in_progress') {
          
          await NotificationService.notifyAdmins({
            type: 'rescue_started',
            title: 'Rescue Started',
            message: `${req.user.username} has started rescuing the dog at ${report.location}`,
            relatedId: report.id,
            relatedType: 'report',
            priority: 'medium'
          });

          await NotificationService.notifyReporter({
            reportId: report.id,
            type: 'rescue_started',
            title: 'Rescue In Progress!',
            message: `Great news! ${req.user.username} has started the rescue operation for the dog you reported at ${report.location}`,
            priority: 'high'
          });
        } else if (status === 'resolved') {
          
          await NotificationService.notifyAdmins({
            type: 'rescue_completed',
            title: 'Rescue Completed',
            message: `${req.user.username} has successfully rescued the dog at ${report.location}`,
            relatedId: report.id,
            relatedType: 'report',
            priority: 'medium'
          });

          await NotificationService.notifyReporter({
            reportId: report.id,
            type: 'rescue_completed',
            title: 'Rescue Completed! 🎉',
            message: `The dog you reported at ${report.location} has been successfully rescued by ${req.user.username}. Thank you for helping!`,
            priority: 'high'
          });
        }
      } catch (notifError) {
        console.error('Error sending status update notifications:', notifError);
      }
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating dog report' });
  }
});




router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await DogReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Dog report not found' });
    }

    
    if (report.reportedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await report.destroy();
    res.json({ message: 'Dog report removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting dog report' });
  }
});

module.exports = router;
