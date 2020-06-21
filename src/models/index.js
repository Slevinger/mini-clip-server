const Sequelize = require("sequelize");
const config = require("../config");

const sequelize = new Sequelize(config.dbName, config.dbName, config.dbPass, {
  host: config.dbHost,
  dialect: "mysql",
  operatorsAliases: false,

  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Messages = require("./messages.model.js")(sequelize, Sequelize);

module.exports = db;
