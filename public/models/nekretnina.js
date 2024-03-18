const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize'); 
const Upit = require('./upit'); 


const Nekretnina = sequelize.define('Nekretnina', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  tip_nekretnine: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  naziv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kvadratura: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cijena: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  slika: {
    type: DataTypes.STRING, 
    allowNull: true, 
  },
  tip_grijanja: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  lokacija: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  godina_izgradnje: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  datum_objave: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  opis: {
    type: DataTypes.TEXT,
    allowNull: true, 
  }

});

// Veze između modela
Nekretnina.hasMany(Upit);
Upit.belongsTo(Nekretnina);


module.exports = Nekretnina;


