module.exports = (sequelize, DataTypes) => {
  const WithdrawRequest = sequelize.define("withdrawRequest", {
    withdrawAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    walletNumber: {
      type: DataTypes.TEXT,
    },
    accountHolderName: {
      type: DataTypes.STRING,
    },
    accountNumber: {
      type: DataTypes.STRING,
    },
    bankName: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "rejected",
        "processing",
        "canceled",
        "failed",
        "transferred"
      ),
      defaultValue: "pending",
    },
  });
  return WithdrawRequest;
};
