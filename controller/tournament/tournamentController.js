const db = require("../../model");
const Tournament = db.tournament;
const TimeSlots = db.timeSlots;
const customErrorHandler = require("../../utils/customerErrorHandler");
const { Op } = require("sequelize");

// Creating Tournament
exports.createTournament = async (req, res, next) => {
  const {
    tournamentName,
    tournamentDescription,
    tournamentEntryFee,
    tournamentRegistrationStartDate,
    tournamentRegistrationEndDate,
    tournamentStartDate,
    tournamentEndDate,
    tournamentGameMode,
    gameId,
  } = req.body;

  const tournamentIcon = req.files.tournamentIcon[0].fieldname;
  const tournamentCover = req.files.tournamentCover[0].fieldname;
  let tournamentIconUrl;
  let tournamentCoverUrl;

  const tournamentStartDateNumber = new Date(tournamentStartDate).getTime();
  const tournamentEndDateNumber = new Date(tournamentEndDate).getTime();

  // Checking value is number or not
  function isANumber(str) {
    return !/\D/.test(str);
  }

  function startOfDate(start) {
    const startOfDate = new Date(start);
    return startOfDate.getTime();
  }

  function endOfDay(end) {
    const endOfDay = new Date(end);
    return endOfDay.getTime();
  }

  function validateDateRange(start, end, errorMessage) {
    const startDate = startOfDate(start);
    const endDate = endOfDay(end);

    if (startDate >= endDate) {
      return false;
    } else {
      return true;
    }
  }

  const validateRegisterDateRange = validateDateRange(
    tournamentRegistrationStartDate,
    tournamentRegistrationEndDate,
    "registration end date can't be before start date"
  );

  const validateTouramentDateRange = validateDateRange(
    tournamentStartDate,
    tournamentEndDate,
    "tournament end date can't be before start date"
  );

  const validateRegEndAndStartDate = validateDateRange(
    tournamentRegistrationEndDate,
    tournamentStartDate,
    "registration end date can't be before tournament registration start date"
  );

  if (!validateRegisterDateRange) {
    return next(
      customErrorHandler(
        400,
        "registration end date can't be before start date"
      )
    );
  }
  if (!validateTouramentDateRange) {
    return next(
      customErrorHandler(400, "tournament end date can't be before start date")
    );
  }
  if (!validateRegEndAndStartDate)
    return next(
      customErrorHandler(
        400,
        "registration end date can't be before tournament registration start date"
      )
    );

  // Checking Validation
  if (!tournamentName) {
    return res.status(400).json({ message: "Tournament Name is Required" });
  } else if (!tournamentDescription) {
    return res
      .status(400)
      .json({ message: "Tournament Description is Required" });
  } else if (!tournamentIcon) {
    return res.status(400).json({ message: "Please Insert tournament icon" });
  } else if (!tournamentCover) {
    return res
      .status(400)
      .json({ message: "Please Insert tournament cover image" });
  } else if (!tournamentEntryFee) {
    return res.status(400).json({ message: "Please Provide Entry Fee!" });
  } else if (!isANumber(tournamentEntryFee)) {
    return res
      .status(400)
      .json({ message: "Enter only Integer value in tournaemnt fee!" });
  } else if (!tournamentRegistrationStartDate) {
    return res
      .status(400)
      .json({ message: "Registration Start Date is Required!" });
  } else if (!tournamentRegistrationEndDate) {
    return res
      .status(400)
      .json({ message: "Registration End Date is Required!" });
  } else if (!tournamentStartDate) {
    return res
      .status(400)
      .json({ message: "Tournament Start Date is Required!" });
  } else if (!tournamentEndDate) {
    return res
      .status(400)
      .json({ message: "Tournament End Date is Required!" });
  } else if (!tournamentGameMode) {
    return res
      .status(400)
      .json({ message: "Tournament Game mode is Required!" });
  } else if (!gameId) {
    return res.status(400).json({ message: "Please Insert GameID" });
  }

  if (tournamentIcon && tournamentCover) {
    await uploadToS3(req.files.tournamentIcon[0])
      .then((result) => {
        tournamentIconUrl = result.Location;
      })
      .catch((error) => {
        console.log(error.message);
      });

    await uploadToS3(req.files.tournamentCover[0])
      .then((result) => {
        tournamentCoverUrl = result.Location;
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  try {
    const tournament = await Tournament.create({
      tournamentName,
      tournamentIcon: tournamentIconUrl,
      tournamentCover: tournamentCoverUrl,
      tournamentDescription,
      tournamentEntryFee,
      tournamentRegistrationStartDate,
      tournamentRegistrationEndDate,
      tournamentStartDate,
      tournamentEndDate,
      tournamentStartDateNumber,
      tournamentEndDateNumber,
      tournamentGameMode,
      gameId,
    });

    /// displaying success or failed message
    if (tournament) {
      res
        .status(201)
        .json({ message: "Tournament Added!", status: 201, tournament });
    } else {
      res.status(400).json({ message: "Failed to Create Tournament!" });
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

// Getting all Tournament
exports.getAllTournament = async (req, res, next) => {
  const allTournament = await Tournament.findAll({
    attributes: [
      "id",
      "tournamentName",
      "tournamentDescription",
      "tournamentIcon",
      "tournamentCover",
      "tournamentEntryFee",
      "tournamentRegistrationStartDate",
      "tournamentRegistrationEndDate",
      "tournamentGameMode",
      "tournamentStartDate",
      "tournamentEndDate",
    ],

    include: [
      { model: db.games, attributes: ["id", "gameName"] },
      {
        model: TimeSlots,
        attributes: ["id", "startTime", "endTime"],
      },
      {
        model: db.prizePool,
        attributes: ["id", "prize", "placements"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  if (allTournament == 0) {
    return res.json({ message: "No Tournament", status: 204 });
  }
  return res.status(200).json({ allTournament, status: 200 });
};

// Getting only one tournament
exports.getOneTournament = async (req, res) => {
  const { id } = req.params;

  const findTournament = await Tournament.findByPk(id, {
    include: [
      { model: db.games },
      {
        model: TimeSlots,
      },
      {
        model: db.prizePool,
      },
    ],
  });
  if (!findTournament) {
    return res
      .status(404)
      .json({ message: "Couldnot find Tournament", status: 404 });
  }
  return res.status(200).json({ Tournament: findTournament, status: 200 });
};

//upcoming tournament
exports.displayUpcomingTournament = async (req, res) => {
  const currentDate = new Date().getTime();
  const upComingTournament = await Tournament.findAll({
    where: {
      tournamentStartDateNumber: { [Op.gte]: currentDate },
    },
    attributes: [
      "id",
      "tournamentName",
      "tournamentDescription",
      "tournamentIcon",
      "tournamentCover",
      "tournamentEntryFee",
      "tournamentRegistrationStartDate",
      "tournamentRegistrationEndDate",
      "tournamentGameMode",
    ],

    include: [
      { model: db.games, attributes: ["id", "gameName"] },
      {
        model: TimeSlots,
        attributes: ["id", "startTime", "endTime"],
      },
      {
        model: db.prizePool,
        attributes: ["id", "prize", "placements"],
      },
    ],
  });

  return res.status(200).json(upComingTournament);
};

// on going tournament
exports.displayOnGoingTournament = async (req, res) => {
  const currentDate = new Date().getTime();
  const onGoingTournament = await Tournament.findAll({
    where: {
      [Op.and]: [
        { tournamentStartDateNumber: { [Op.lte]: currentDate } }, // tournamentStartDate <= currentDate
        { tournamentEndDateNumber: { [Op.gte]: currentDate } }, // tournamentEndDate >= currentDate
      ],
    },
    attributes: [
      "id",
      "tournamentName",
      "tournamentDescription",
      "tournamentIcon",
      "tournamentCover",
      "tournamentEntryFee",
      "tournamentRegistrationStartDate",
      "tournamentRegistrationEndDate",
      "tournamentGameMode",
    ],

    include: [
      { model: db.games, attributes: ["id", "gameName"] },
      {
        model: TimeSlots,
        attributes: ["id", "startTime", "endTime"],
      },
      {
        model: db.prizePool,
        attributes: ["id", "prize", "placements"],
      },
    ],
  });

  return res.json(onGoingTournament);
};

//past tournament
exports.displayPastTournament = async (req, res) => {
  const currentDate = new Date().getTime();
  const pastTournament = await Tournament.findAll({
    where: {
      tournamentEndDateNumber: { [Op.lte]: currentDate },
    },
    attributes: [
      "id",
      "tournamentName",
      "tournamentDescription",
      "tournamentIcon",
      "tournamentCover",
      "tournamentEntryFee",
      "tournamentRegistrationStartDate",
      "tournamentRegistrationEndDate",
      "tournamentGameMode",
    ],

    include: [
      { model: db.games, attributes: ["id", "gameName"] },
      {
        model: TimeSlots,
        attributes: ["id", "startTime", "endTime"],
      },
      {
        model: db.prizePool,
        attributes: ["id", "prize", "placements"],
      },
    ],
  });

  return res.json(pastTournament);
};

// Updating Tournament
exports.updateTournament = async (req, res, next) => {
  const {
    tournamentName,
    tournamentDescription,
    tournamentEntryFee,
    tournamentRegistrationStartDate,
    tournamentRegistrationEndDate,
    tournamentStartDate,
    tournamentEndDate,
    tournamentGameMode,
    tournamentStreamingLink,
    featuredTournament,
  } = req.body;
  const { id } = req.params;

  const tournamentStartDateNumber = new Date(tournamentStartDate).getTime();
  const tournamentEndDateNumber = new Date(tournamentEndDate).getTime();

  function startOfDate(start) {
    const startOfDate = new Date(start);
    return startOfDate.getTime();
  }

  function endOfDay(end) {
    const endOfDay = new Date(end);
    return endOfDay.getTime();
  }

  function validateDateRange(start, end, errorMessage) {
    const startDate = startOfDate(start);
    const endDate = endOfDay(end);

    if (startDate >= endDate) {
      return false;
    } else {
      return true;
    }
  }

  const validateRegisterDateRange = validateDateRange(
    tournamentRegistrationStartDate,
    tournamentRegistrationEndDate,
    "registration end date can't be before start date"
  );

  const validateTouramentDateRange = validateDateRange(
    tournamentStartDate,
    tournamentEndDate,
    "tournament end date can't be before start date"
  );

  const validateRegEndAndStartDate = validateDateRange(
    tournamentRegistrationEndDate,
    tournamentStartDate,
    "registration end date can't be before tournament registration start date"
  );

  if (!validateRegisterDateRange) {
    return next(
      customErrorHandler(
        400,
        "registration end date can't be before start date"
      )
    );
  }
  if (!validateTouramentDateRange) {
    return next(
      customErrorHandler(400, "tournament end date can't be before start date")
    );
  }
  if (!validateRegEndAndStartDate)
    return next(
      customErrorHandler(
        400,
        "registration end date can't be before tournament registration start date"
      )
    );

  const tournament = await Tournament.findByPk(id);
  if (!tournament) {
    return res.status(404).json({
      status: 404,
      message: "Could not find tournament to update!",
    });
  }

  //update streaming link
  if (tournamentStreamingLink) {
    tournament.tournamentStreamingLink = tournamentStreamingLink;
  }

  // update featured tournament
  if (featuredTournament) {
    tournament.featuredTournament = featuredTournament;
  }

  //update Tournament name
  if (tournamentName) {
    tournament.tournamentName = tournamentName;
  }

  //updating tournament description
  if (tournamentDescription) {
    tournament.tournamentDescription = tournamentDescription;
  }
  // updating tournament entry fee
  if (tournamentEntryFee) {
    tournament.tournamentEntryFee = tournamentEntryFee;
  }
  // updating registration start date
  if (tournamentRegistrationStartDate) {
    tournament.tournamentRegistrationStartDate =
      tournamentRegistrationStartDate;
  }
  // updating registration end date
  if (tournamentRegistrationEndDate) {
    tournament.tournamentRegistrationEndDate = tournamentRegistrationEndDate;
  }
  // updating start date
  if (tournamentStartDate) {
    tournament.tournamentStartDate = tournamentStartDate;
    tournament.tournamentStartDateNumber = tournamentStartDateNumber;
  }
  // updating end date
  if (tournamentEndDate) {
    tournament.tournamentEndDate = tournamentEndDate;
    tournament.tournamentEndDateNumber = tournamentEndDateNumber;
  }
  //updating game mode
  if (tournamentGameMode) {
    tournament.tournamentGameMode = tournamentGameMode;
  }

  // tournament icon url
  let newTournamentIconUrl;
  if (req.files.tournamentIcon) {
    const tournamentIcon = req.files.tournamentIcon[0];
    const keys = tournament.tournamentIcon.split("/").pop();
    deleteFromS3(keys); // deleting image form s3 bucket
    await uploadToS3(tournamentIcon).then((result) => {
      newTournamentIconUrl = result.Location;
    });
    tournament.tournamentIcon = newTournamentIconUrl;
  }

  // tournament cover url
  let newTournamentCoverUrl;
  if (req.files.tournamentCover) {
    const tournamentCover = req.files.tournamentCover[0];
    const keys = tournament.tournamentCover.split("/").pop();
    deleteFromS3(keys); // deleting image from s3
    await uploadToS3(tournamentCover).then((result) => {
      newTournamentCoverUrl = result.Location;
    });
    tournament.tournamentCover = newTournamentCoverUrl;
  }

  //updating tournament streaming_linkstart
  if (tournamentStreamingLink) {
    tournament.tournament_streaming_link = tournamentStreamingLink;
  }
  //saving update data into database
  tournament.save();
  return res.status(200).json({ message: "updated succesfully", tournament });
};

// Deleting Tournament
exports.deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!tournament) {
      return res.status(404).json({
        message: "Could not find tournament or tournament already deleted",
        status: 404,
      });
    }
    const tournamentIconKey = tournament.tournamentIcon.split("/").pop();
    const tournamentCoverKey = tournament.tournamentCover.split("/").pop();
    const deleteTournament = await Tournament.destroy({
      where: { id: req.params.id },
    });

    if (deleteTournament) {
      deleteFromS3(tournamentIconKey);
      deleteFromS3(tournamentCoverKey);
    }

    res.status(200).json({ message: "Tournament is deleted !", status: 200 });
  } catch (error) {
    next(error);
  }
};

//feature tournament
exports.getAllFeaturedTournament = async (req, res, next) => {
  const featuredTournament = await Tournament.findAll({
    where: { featuredTournament: true },
    attributes: [
      "id",
      "tournamentName",
      "tournamentDescription",
      "tournamentIcon",
      "tournamentCover",
      "tournamentEntryFee",
      "tournamentRegistrationStartDate",
      "tournamentRegistrationEndDate",
    ],

    include: [
      { model: db.games, attributes: ["id", "gameName"] },
      // {
      //   model: TimeSlots, attributes:["id"],
      // },
      {
        model: db.prizePool,
        attributes: ["id", "prize"],
      },
    ],
  });
  return res.status(200).json({ featuredTournament, status: 200 });
};
