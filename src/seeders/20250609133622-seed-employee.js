'use strict';

const crypto = require("crypto");
const { hashPassword } = require("../helpers/bcrypt");

const adjectives = [
  "happy", "brave", "smart", "silly", "clever", "funny", "curious", "jolly", "zany", "swift", "quiet", "fuzzy", "mighty", "gentle", "crazy", "sneaky"
];

const animals = [
  "tiger", "panda", "eagle", "lion", "fox", "bear", "owl", "wolf", "otter", "rabbit", "cat", "dog", "falcon", "shark", "whale", "monkey", "sloth", "koala", "horse", "snake"
];

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateRandomName(num) {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adj}-${animal}-${num}`
};

function generateRandomSalary() {
  return (Math.floor(Math.random() * 11) + 5) * 1_000_000
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const employees = [];
    const numbers = shuffle(Array.from({ length: 100 }, (_, i) => i + 10 ))

    for (let i = 0; i < 100; i++) {
      employees.push({
        id: crypto.randomUUID(),
        username: generateRandomName(numbers[i]),
        password: hashPassword("employee123"),
        salary: generateRandomSalary(), 
        created_at: new Date(),
        updated_at: new Date()
      })
    }

    await queryInterface.bulkInsert("employees", employees, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("employees", {
      username: {
        [Sequelize.Op.regexp]: '^[a-z]+-[a-z]+-[0-9]{2,3}$'
      }
    })
  }
};
