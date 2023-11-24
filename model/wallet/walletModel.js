module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define("wallet", {
    balance: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.0,
    },
  });
  return Wallet;
};
