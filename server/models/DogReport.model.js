const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DogReport = sequelize.define('DogReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 1000]
    }
  },
  imageUrl: {
    type: DataTypes.TEXT,  
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  reporter_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reporter_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reporter_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  additionalNotes: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = DogReport;
