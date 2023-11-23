module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: "/uploads/avatar/avatar.png",
    },
    bio: {
      type: DataTypes.TEXT,
    },
    wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tournamentPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  return User;
};
