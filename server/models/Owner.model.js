const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Owner = sequelize.define('Owner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  business_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [2, 150]
    }
  },
  id_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [5, 50],
      isUppercase: true
    }
  },
  ownership_type: {
    type: DataTypes.ENUM('shelter', 'rescue_center', 'veterinary_clinic', 'individual', 'ngo'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [20, 500]
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 1000
    }
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Owner;
