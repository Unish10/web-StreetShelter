const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'DogReports',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  commentType: {
    type: DataTypes.ENUM('comment', 'update', 'status_change'),
    defaultValue: 'comment',
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Store additional data like old_status, new_status for status changes'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['reportId'] },
    { fields: ['userId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Comment;
