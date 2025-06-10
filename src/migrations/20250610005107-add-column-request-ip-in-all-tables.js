'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // Add to attendances
    await queryInterface.addColumn('attendances', 'request_ip', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add to overtimes
    await queryInterface.addColumn('overtimes', 'request_ip', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add to reimbursements
    await queryInterface.addColumn('reimbursements', 'request_ip', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add to payrolls
    await queryInterface.addColumn('payrolls', 'request_ip', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add to payslips
    await queryInterface.addColumn('payslips', 'request_ip', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove from attendances
    await queryInterface.removeColumn('attendances', 'request_ip');

    // Remove from overtimes
    await queryInterface.removeColumn('overtimes', 'request_ip');

    // Remove from reimbursements
    await queryInterface.removeColumn('reimbursements', 'request_ip');

    // Remove from payrolls
    await queryInterface.removeColumn('payrolls', 'request_ip');

    // Remove from payslips
    await queryInterface.removeColumn('payslips', 'request_ip');
  }
};
