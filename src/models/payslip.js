'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payslip extends Model {
    static associate(models) {
      // Each payslip belongs to one employee
      Payslip.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        as: "employee"
      });

      // Each payslip belongs to one payroll batch
      Payslip.belongsTo(models.Payroll, {
        foreignKey: "payroll_id",
        as: "payroll"
      });

      // Admin who created the payslip
      Payslip.belongsTo(models.Admin, {
        foreignKey: "created_by",
        as: "creator"
      });

      // Admin who updated the payslip
      Payslip.belongsTo(models.Admin, {
        foreignKey: "updated_by",
        as: "updater"
      });
    }
  }
  Payslip.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    payroll_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'payrolls',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    base_salary: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    attendance_days: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    attendance_adjustment: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    attendance_pay: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    overtime_hours: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    overtime_rate: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    overtime_pay: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reimbursement_total: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reimbursement_detail: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    take_home_pay: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
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
    modelName: 'Payslip',
    tableName: 'payslips',
    timestamps: false,
  });
  return Payslip;
};