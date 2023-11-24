module.exports = (sequelize, DataTypes) => {
  const Tournament = sequelize.define("tournament", {
    tournamentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tournamentIcon: {
      type: DataTypes.TEXT,
      // allowNull: false,
    },
    tournamentCover: {
      type: DataTypes.TEXT,
      // allowNull: false,
    },
    tournamentDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tournamentEntryFee: {
      type: DataTypes.DOUBLE,
    },
    tournamentRegistrationStartDate: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    tournamentRegistrationEndDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tournamentStartDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tournamentEndDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tournamentStartDateNumber: {
      type: DataTypes.STRING,
    },
    tournamentEndDateNumber: {
      type: DataTypes.STRING,
    },
    tournamentGameMode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tournamentStreamingLink: {
      type: DataTypes.TEXT,
    },
    featuredTournament: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  return Tournament;
};
