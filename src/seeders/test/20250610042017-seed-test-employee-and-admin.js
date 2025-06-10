'use strict';
const crypto = require("crypto");
const { hashPassword } = require("../../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const password = hashPassword("password123")

    await queryInterface.bulkInsert('employees', [
      {
        id: crypto.randomUUID(),
        username: 'employee_01',
        password: password,
        salary: 5000000,
      },
      {
        id: crypto.randomUUID(),
        username: 'employee_02',
        password: password,
        salary: 7000000,
      },
      {
        id: crypto.randomUUID(),
        username: 'employee_03',
        password: password,
        salary: 9000000,
      }
    ]);

    await queryInterface.bulkInsert('admins', [
      {
        id: crypto.randomUUID(),
        username: 'pretty-admin-01',
        password: password,
      },
      {
        id: crypto.randomUUID(),
        username: 'pretty-admin-02',
        password: password,
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', {
      username: ['employee_01', 'employee_02', 'employee_03']
    });

    await queryInterface.bulkDelete('admins', {
      username: ['pretty-admin-01', 'pretty-admin-02']
    });
  }
};
