'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
  
      Attendance.belongsTo(models.Employee, { foreignKey: "employee_id" });
      Attendance.belongsTo(models.Employee, { foreignKey: "created_by" });
      Attendance.belongsTo(models.Employee, { foreignKey: "updated_by" });
    }
  }
  Attendance.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Generates UUID automatically
      allowNull: false,
      primaryKey: true
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    request_id: {
      type: DataTypes.UUID,
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
    }
  }, {
    sequelize,
    tableName: 'attendance',
    modelName: 'Attendance',
  });
  return Attendance;
};