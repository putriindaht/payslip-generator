'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Audit_log extends Model {
    static associate(models) {
      // define association here
    }
  }
  Audit_log.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    record_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    table_name: {
      type: DataTypes.STRING,
       allowNull: false
    },
    operation: {
      type: DataTypes.STRING,
       allowNull: false
    },
    request_ip: {
      type: DataTypes.STRING,
       allowNull: false
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_by_type: {
      type: DataTypes.STRING,
       allowNull: false
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    updated_by_type: {
      type: DataTypes.STRING,
       allowNull: false
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW')
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW')
    },
     is_deleted: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Audit_log',
    tableName: 'audit_logs',
    timestamps: false,
  });
  return Audit_log;
};