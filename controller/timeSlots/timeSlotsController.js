const db = require("../../model");
const TimeSlot = db.timeSlots;

exports.createTimeSlot = async (req, res, next) => {
  const { startTime, endTime, maxNoOfParticipants } = req.body;
  const tournamentId = req.params.tournamentId;
  const startTimeNumber = new Date(startTime).getTime();
  const endTimeNumber = new Date(endTime).getTime();

  //Check if any fields are empty
  if (!startTime || !endTime || !maxNoOfParticipants) {
    return res.status(400).json({
      message: "Missing required fields!",
      status: 400,
    });
  }

  const timeSlot = await TimeSlot.create({
    startTime: startTime,
    endTime,
    maxNoOfParticipants,
    tournamentId,
    startTimeNumber,
    endTimeNumber,
  });

  res.status(200).json({
    message: "Time slot created successfully",
    timeSlot,
    status: 200,
  });
};

exports.getAllTimeSlots = async (req, res, next) => {
  try {
    const timeSlots = await TimeSlot.findAll({
      attributes: ["id", "startTime", "endTime", "maxNoOfParticipnts"],
    });
    if (timeSlots.length != 0) {
      return res.status(200).json({
        message: "Successfully fetched.",
        data: timeSlots,
      });
    } else {
      return res.status(400).json({
        message: "No time slots available!",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getSingleTimeSlot = async (req, res, next) => {
  const timeSlotId = req.params.timeSlotId;
  try {
    const timeSlot = await TimeSlot.findByPk(timeSlotId);
    if (timeSlot != null) {
      return res.status(200).json({
        message: "Time slot found",
        data: timeSlot,
      });
    } else {
      return res.status(400).json({
        message: "Time slot with given id doesn't exist.",
        status: 400,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateTimeSlot = async (req, res) => {
  const { startTime, endTime, maxNoOfParticipants } = req.body;
  const timeSlotId = req.params.timeSlotId;
  if (!startTime || !endTime || !maxNoOfParticipants) {
    return res.status(400).json({
      message: "Missing required fields!",
      status: 400,
    });
  }
  const startTimeNumber = new Date(startTime).getTime();
  const endTimeNumber = new Date(endTime).getTime();

  const timeSlot = await TimeSlot.findByPk(timeSlotId);
  if (!timeSlot) {
    return res.status(404).json({
      message: "Time slot not found",
      status: 404,
    });
  }

  // Update time slot properties
  timeSlot.startTime = startTime;
  timeSlot.endTime = endTime;
  timeSlot.startTimeNumber = startTimeNumber;
  timeSlot.endTimeNumber = endTimeNumber;
  timeSlot.maxNoOfParticipants = maxNoOfParticipants;

  await timeSlot.save();

  return res.status(200).json({
    message: "Time slot updated successfully",
    timeSlot,
    status: 200,
  });
};

exports.deleteTimeSlot = async (req, res, error) => {
  const timeSlotId = req.params.timeSlotId;
  try {
    // this stores the no of rows affected
    const timeSlot = await TimeSlot.destroy({
      where: {
        id: timeSlotId,
      },
    });

    //checking if any rows is affected by the above query
    if (timeSlot != 0) {
      return res.status(200).json({
        message: "Time slot deleted successfully.",
        status: 200,
      });
    } else {
      return res.status(400).json({
        message: "Time slot is not found or deleted already.",
        status: 400,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.displayTimeSlotByTournamentId = async (req, res, next) => {
  const { tournamentId } = req.params;
  const timeSloteById = await TimeSlot.findAll({
    where: { tournamentId },
    include: [{ model: db.tournamentRegistration, attributes: ["id"] }],
  });
  return res.status(200).json({ timeSlot: timeSloteById });
};
