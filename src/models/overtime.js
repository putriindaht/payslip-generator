'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Overtime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Overtime.belongsTo(models.Employee, { foreignKey: "employee_id", as: "employee" });
      Overtime.belongsTo(models.Employee, { foreignKey: "created_by", as: "creator" });
      Overtime.belongsTo(models.Employee, { foreignKey: "updated_by", as: "updater" });
    }
  }
  Overtime.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    employee_id:{
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    hours_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    request_id:{
      type: DataTypes.UUID,
      allowNull: false
    },
    created_by:{
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    updated_by:{
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
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
    modelName: 'Overtime',
    tableName: 'overtimes',
    timestamps: false,
  });
  return Overtime;
};