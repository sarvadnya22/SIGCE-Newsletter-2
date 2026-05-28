const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'newsletter.sqlite'),
  logging: false // Set to console.log to see SQL queries if needed
});

module.exports = sequelize;
