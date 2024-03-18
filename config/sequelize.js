const Sequelize = require('sequelize');
const sequelize = new Sequelize('wt24', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
}); 

//NAPOMENA: Koiristila sam password bez passworda '' 
//iz razloga jer mi je tako podešen XAMPP i PhpMyAdmin
//kada sam htjela da promijenim nije moglo, davalo je čudne greške
//koje nisam znala riješiti
//tako da je ostavljeno ovako

module.exports = sequelize;
