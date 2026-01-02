const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  fullName: {
    field: 'full_name',
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  password: {
    field: 'password_hash',
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM('super_admin', 'tenant_admin', 'user'),
    defaultValue: 'user'
  },

  tenantId: {
    field: 'tenant_id',
    type: DataTypes.UUID,
    allowNull: true
  },

  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE
  },

  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE
  }

}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email', 'tenant_id']
    }
  ]
});

module.exports = User;
