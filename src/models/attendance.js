'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      // The employee this attendance record belongs to
      Attendance.belongsTo(models.Employee, { foreignKey: "employee_id", as: "employee" });
      // The employee who created the record
      Attendance.belongsTo(models.Employee, { foreignKey: "created_by", as: "creator" });
      // The employee who last updated the record
      Attendance.belongsTo(models.Employee, { foreignKey: "updated_by", as: "updater" });
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
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
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
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
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
    },
    is_deleted: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    request_ip: {
    type: DataTypes.STRING,
    allowNull: true
}
  }, {
    sequelize,
    tableName: 'attendances',
    modelName: 'Attendance',
    timestamps: false,
  });
  return Attendance;
};