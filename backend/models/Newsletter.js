const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
  title: { type: DataTypes.STRING, allowNull: false },
  semester: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  vision: { type: DataTypes.TEXT },
  mission: { type: DataTypes.JSON }, // Array of strings
  peos: { type: DataTypes.JSON },    // Array of strings
  psos: { type: DataTypes.JSON },    // Array of strings
  hodMessage: { type: DataTypes.TEXT },
  principalMessage: { type: DataTypes.TEXT },
  headerImage: { type: DataTypes.STRING },
  toppers: { type: DataTypes.JSON }, // Array of objects
  events: { type: DataTypes.JSON },  // Array of objects
  customSections: { type: DataTypes.JSON } // Array of objects
}, {
  timestamps: true
});

module.exports = Newsletter;
