module.exports = (sequelize, DataTypes) => {
  const TimeSlots = sequelize.define("timeSlots", {
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxNoOfParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startTimeNumber: {
      type: DataTypes.STRING,
    },
    endTimeNumber: {
      type: DataTypes.STRING,
    },
  });
  return TimeSlots;
};
