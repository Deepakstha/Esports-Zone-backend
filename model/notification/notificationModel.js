module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("notification", {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    users: {
      type: DataTypes.STRING,
    },
    sender: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    receiver: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    links: {
      type: DataTypes.TEXT,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  return Notification;
};
