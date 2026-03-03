const User = require('./User.model');
const DogReport = require('./DogReport.model');
const Owner = require('./Owner.model');
const OTP = require('./OTP.model');
const Notification = require('./Notification.model');


User.hasMany(DogReport, { foreignKey: 'reportedBy', as: 'dogReports' });
DogReport.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });

User.hasOne(Owner, { foreignKey: 'userId', as: 'ownerProfile' });
Owner.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  DogReport,
  Owner,
  OTP,
  Notification
};
