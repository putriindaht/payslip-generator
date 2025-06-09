'use strict';
const crypto = require("crypto");
const { hashPassword } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   const admin = {
    id: crypto.randomUUID(),
    username: "pretty-admin-01",
    password: hashPassword("admin123"),
    created_at: new Date(),
    updated_at: new Date()
   }

   await queryInterface.bulkInsert('admins', [admin], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', { username: "pretty-admin-01" }, {});
  }
};
