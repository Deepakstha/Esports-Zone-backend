module.exports = (sequelize, DataTypes) => {
  const TopUp = sequelize.define("topUp", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    transaction_id: {
      type: DataTypes.STRING,
    },
    fee: { type: DataTypes.INTEGER },
    refunded: { type: DataTypes.BOOLEAN },
  });
  return TopUp;
};
