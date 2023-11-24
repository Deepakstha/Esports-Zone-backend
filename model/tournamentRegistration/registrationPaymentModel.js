module.exports = (sequelize, DataTypes) => {
  const RegistrationPayment = sequelize.define("registrationPayment", {
    amount: {
      type: DataTypes.STRING,
    },
  });
  return RegistrationPayment;
};
