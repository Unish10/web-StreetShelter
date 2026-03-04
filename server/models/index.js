const User = require('./User.model');
const DogReport = require('./DogReport.model');
const Owner = require('./Owner.model');
const OTP = require('./OTP.model');
const Notification = require('./Notification.model');
const Comment = require('./Comment.model');


User.hasMany(DogReport, { foreignKey: 'reportedBy', as: 'dogReports' });
DogReport.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });

User.hasOne(Owner, { foreignKey: 'userId', as: 'ownerProfile' });
Owner.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Comment relationships
DogReport.hasMany(Comment, { foreignKey: 'reportId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(DogReport, { foreignKey: 'reportId', as: 'report' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  DogReport,
  Owner,
  OTP,
  Notification,
  Comment
};
