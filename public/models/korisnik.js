const { DataTypes } = require('sequelize'); 
const sequelize = require('../../config/sequelize');
const Upit = require('./upit'); 

const Korisnik = sequelize.define('Korisnik', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ime: DataTypes.STRING,
  prezime: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
});


// Veze između modela
Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);


module.exports = Korisnik;
