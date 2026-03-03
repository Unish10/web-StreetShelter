const { Notification, User } = require('../models');

class NotificationService {
  
  static async createNotification({
    userId,
    type,
    title,
    message,
    relatedId = null,
    relatedType = null,
    priority = 'medium'
  }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        priority
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  
  static async notifyAdmins({ type, title, message, relatedId, relatedType, priority = 'high' }) {
    try {
      const admins = await User.findAll({
        where: { role: 'admin' }
      });

      const notifications = await Promise.all(
        admins.map(admin => 
          this.createNotification({
            userId: admin.id,
            type,
            title,
            message,
            relatedId,
            relatedType,
            priority
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error notifying admins:', error);
      throw error;
    }
  }

  
  static async notifyVerifiedOwners({ type, title, message, relatedId, relatedType, priority = 'medium' }) {
    try {
      const owners = await User.findAll({
        where: { role: 'owner' },
        include: [{
          model: require('../models/Owner.model'),
          as: 'ownerProfile',
          where: { isVerified: true }
        }]
      });

      const notifications = await Promise.all(
        owners.map(owner => 
          this.createNotification({
            userId: owner.id,
            type,
            title,
            message,
            relatedId,
            relatedType,
            priority
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error notifying owners:', error);
      throw error;
    }
  }

  
  static async notifyReporter({ reportId, type, title, message, priority = 'medium' }) {
    try {
      const DogReport = require('../models/DogReport.model');
      const report = await DogReport.findByPk(reportId);
      
      if (!report) {
        throw new Error('Report not found');
      }

      return await this.createNotification({
        userId: report.reportedBy,
        type,
        title,
        message,
        relatedId: reportId,
        relatedType: 'report',
        priority
      });
    } catch (error) {
      console.error('Error notifying reporter:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
