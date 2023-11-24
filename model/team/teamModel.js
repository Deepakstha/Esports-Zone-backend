module.exports = (sequelize, DataTypes) => {
  const Teams = sequelize.define("teams", {
    teamName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: {
      type: DataTypes.TEXT,
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slug: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tournamentsPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  return Teams;
};
