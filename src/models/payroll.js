'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    static associate(models) {
      // The admin who created this payroll
      Payroll.belongsTo(models.Admin, { foreignKey: "created_by", as: "creator" });
      // The admin who last updated this payroll
      Payroll.belongsTo(models.Admin, { foreignKey: "updated_by", as: "updater" });

      // A payroll batch has many payslips
      Payroll.hasMany(models.Payslip, { foreignKey: "payroll_id", as: "payslips" });
    }
  }
  Payroll.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull:false
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull:false
    },
    request_id:{
      type:DataTypes.INTEGER,
      allowNull: false
    },
    run_at: {
      type: DataTypes.DATE,
      allowNull:true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull:true
    },
    created_by:{
      type:DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    updated_by:{
      type:DataTypes.INTEGER,
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
    },
    request_ip: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Payroll',
    tableName: 'payrolls',
    timestamps: false,
  });
  return Payroll;
};