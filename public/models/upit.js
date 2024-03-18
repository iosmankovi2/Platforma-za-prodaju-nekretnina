const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize'); 

const Upit = sequelize.define('Upit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  korisnik_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tekst_upita: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});


module.exports = Upit;

