'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      // Attendances (owned, created, updated)
      Employee.hasMany(models.Attendance, { foreignKey: "employee_id", as: "attendances" });
      Employee.hasMany(models.Attendance, { foreignKey: "created_by", as: "attendances_created" });
      Employee.hasMany(models.Attendance, { foreignKey: "updated_by", as: "attendances_updated" });

      // Overtimes (owned, created, updated)
      Employee.hasMany(models.Overtime, { foreignKey: "employee_id", as: "overtimes" });
      Employee.hasMany(models.Overtime, { foreignKey: "created_by", as: "overtimes_created" });
      Employee.hasMany(models.Overtime, { foreignKey: "updated_by", as: "overtimes_updated" });

      // Reimbursements (owned, created, updated)
      Employee.hasMany(models.Reimbursement, { foreignKey: "employee_id", as: "reimbursements" });
      Employee.hasMany(models.Reimbursement, { foreignKey: "created_by", as: "reimbursements_created" });
      Employee.hasMany(models.Reimbursement, { foreignKey: "updated_by", as: "reimbursements_updated" });
    }
  }

  Employee.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    salary: {
      type: DataTypes.INTEGER,
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
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: false,
  });

  return Employee;
};
