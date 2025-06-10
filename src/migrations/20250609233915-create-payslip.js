'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payslips', {
       id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      employee_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      payroll_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'payrolls',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      base_salary: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      attendance_days: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      attendance_adjustment: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      attendance_pay: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      overtime_hours: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      overtime_rate: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      overtime_pay: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      reimbursement_total: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      reimbursement_detail: {
        allowNull: true,
        type: Sequelize.JSONB
      },
      take_home_pay: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      request_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      created_by: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      updated_by: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payslips');
  }
};