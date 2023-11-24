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
db.games = require("./game/gamesModel")(sequelize, DataTypes);
db.tournament = require("./tournament/tournamentModel")(sequelize, DataTypes);
db.timeSlots = require("./timeSlots/timeSlotsModel")(sequelize, DataTypes);
db.prizePool = require("./prizePool/prizePoolModel")(sequelize, DataTypes);
db.teams = require("./team/teamModel")(sequelize, DataTypes);
db.wallet = require("./wallet/walletModel")(sequelize, DataTypes);
db.topUp = require("./topUp/topUpModel")(sequelize, DataTypes);
db.tournamentRegistration =
  require("./tournamentRegistration/tournamentRegistrationModel")(
    sequelize,
    DataTypes
  );
db.registrationPayment =
  require("./tournamentRegistration/registrationPaymentModel")(
    sequelize,
    DataTypes
  );
db.teamPlayers = require("./team/teamPlayersModel")(sequelize, DataTypes);
db.inGameId = require("./game/inGameIdModel")(sequelize, DataTypes);
db.tournamentResult = require("./tournament/tournamentResultModel")(
  sequelize,
  DataTypes
);
db.Notification = require("./notification/notificationModel")(
  sequelize,
  DataTypes
);
db.withdrawRequest = require("./withdrawRequest/withdrawRequestModel")(
  sequelize,
  DataTypes
);

db.tournamentHistory = require("./tournament/tournamentHistoryModel")(
  sequelize,
  DataTypes
);

// relation with games and tournament
db.games.hasMany(db.tournament, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.tournament.belongsTo(db.games);

//relation with tournament and timeslots
db.tournament.hasMany(db.timeSlots, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.timeSlots.belongsTo(db.tournament);

// relation with tournament with prizepool
db.tournament.hasMany(db.prizePool, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.prizePool.belongsTo(db.tournament);

//relation of temas and user
db.user.hasOne(db.teams, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
  constraints: true,
});
db.teams.belongsTo(db.user, {
  foreignKey: "userId",
  constraints: true,
});

//relation of tournamentregistartion and tournamnent
db.tournament.hasMany(db.tournamentRegistration, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.tournamentRegistration.belongsTo(db.tournament);

// relation of tournamentregistartion and timeslots
db.timeSlots.hasMany(db.tournamentRegistration, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.tournamentRegistration.belongsTo(db.timeSlots);

//relation of tournamentregistartion and user
db.user.hasMany(db.tournamentRegistration);
db.tournamentRegistration.belongsTo(db.user);

//relation of tournamentregistartion and games
db.games.hasMany(db.tournamentRegistration, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
  constraints: true,
});
db.tournamentRegistration.belongsTo(db.games);

//relation of tournamentregistartion and Teams
db.teams.hasMany(db.tournamentRegistration);
db.tournamentRegistration.belongsTo(db.teams);

//relation of Team and team players
db.teams.hasMany(db.teamPlayers, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.teamPlayers.belongsTo(db.teams);

//relation of teams and users
db.user.hasMany(db.teamPlayers);
db.teamPlayers.belongsTo(db.user);

//relation between users and wallet
db.user.hasOne(db.wallet);
db.wallet.belongsTo(db.user);

// relation with user and ingameid
db.user.hasMany(db.inGameId, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.inGameId.belongsTo(db.user);

// relation with games and ingameid
db.games.hasMany(db.inGameId, {
  onDelete: "cascade",
  foreignKey: { allowNull: false },
});
db.inGameId.belongsTo(db.games);

// relation with tournament and tournament result
db.tournament.hasMany(db.tournamentResult, {
  onDelete: "cascade",
});
db.tournamentResult.belongsTo(db.tournament);

// relation with timeslot and tournament result
db.timeSlots.hasOne(db.tournamentResult, {
  onDelete: "cascade",
});
db.tournamentResult.belongsTo(db.timeSlots);

//relation with teams and tournamentresult
db.teams.hasOne(db.tournamentResult);
db.tournamentResult.belongsTo(db.teams);

// relation with user and tournament result
db.user.hasMany(db.tournamentResult);
db.tournamentResult.belongsTo(db.user);

// relation with tournamentRegistration and registrationPayment
db.tournamentRegistration.hasOne(db.registrationPayment);
db.registrationPayment.belongsTo(db.tournamentRegistration);

//relation with user and registrationPayment
db.user.hasMany(db.registrationPayment);
db.registrationPayment.belongsTo(db.user);

//realtion for notification and user
db.user.hasMany(db.Notification, { foreignKey: "sender" });
db.Notification.belongsTo(db.user, { foreignKey: "sender" });

db.wallet.hasMany(db.topUp);
db.topUp.belongsTo(db.wallet);

db.wallet.hasMany(db.withdrawRequest);
db.withdrawRequest.belongsTo(db.wallet);

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
