const dbConfig = require("../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  pool: dbConfig.pool,
  //   logging: false,
  timezone: "+05:45",
});

const dbConnection = () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("DATABASE CONNECTED SUCCESSFULLY!!");
    })
    .catch((error) => {
      console.log("Error", error);
    });
};
dbConnection();

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("./user/userModel")(sequelize, DataTypes);

// for db connection
db.sequelize.sync({ force: false }).then(async () => {
  // Seeding Admin
  await db.user
    .findOrCreate({
      where: {
        email: process.env.ADMIN_EMAIL,
      },
      defaults: {
        fullname: process.env.ADMIN_FULLNAME,
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        role: "admin",
      },
    })
    .then(() => {
      console.log("Admin Seeded Succesfully");
    })
    .catch((err) => {
      return console.log(" error ", err);
    });
});

module.exports = db;
