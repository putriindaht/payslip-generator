'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Payrolls created by this admin
      Admin.hasMany(models.Payroll, {
        foreignKey: "created_by",
        as: "payrolls_created"
      });
      // Payrolls updated by this admin
      Admin.hasMany(models.Payroll, {
        foreignKey: "updated_by",
        as: "payrolls_updated"
      });
      // Payslips created by this admin
      Admin.hasMany(models.Payslip, {
        foreignKey: "created_by",
        as: "payslips_created"
      });
      // Payslips updated by this admin
      Admin.hasMany(models.Payslip, {
        foreignKey: "updated_by",
        as: "payslips_updated"
      });
    }
  }
  Admin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Generates UUID automatically
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
  },
   {
    sequelize,
    tableName: 'admins',
    modelName: 'Admin',
    timestamps: false,
  });
  return Admin;
};