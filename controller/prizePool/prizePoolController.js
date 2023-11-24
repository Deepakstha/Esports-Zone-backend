const customErrorHandler = require("../../utils/customerErrorHandler");
const PrizePool = require("../../model").prizePool;

//Create PrizePool
exports.createPrizePool = async (req, res, next) => {
  const { prize, placements, tournamentId } = req.body;
  // const tournamentId = req.params.tournamentId;

  if (!prize) return next(customErrorHandler(400, "prize is required"));
  if (!placements)
    return next(customErrorHandler(400, "placements is required"));
  if (!tournamentId)
    return next(customErrorHandler(400, "tournamentId is required"));

  const findPrizePool = await PrizePool.findOne({
    where: { placements, tournamentId },
  });

  if (findPrizePool) {
    return res
      .status(409)
      .json({ message: "Prize Already Exist of the Tournament", status: 409 });
  }
  try {
    const prizePool = await PrizePool.create({
      prize,
      placements: Number(placements),
      tournamentId,
    });

    res.status(200).json({
      message: "Prize pool created successfully !",
      data: prizePool,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

// Get All Prize Pool
exports.getAllPrizePool = async (req, res) => {
  try {
    const prizePool = await PrizePool.findAll();
    if (prizePool.length != 0) {
      res.status(200).json({
        message: "Prize pool fetched successfully",
        data: prizePool,
        status: 200,
      });
    } else {
      res.status(400).json({
        message: "No prize pool available",
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

//Get Singel Prize Pool
exports.getSinglePrizePool = async (req, res) => {
  const prizePoolId = req.params.id;

  try {
    const prizePool = await PrizePool.findByPk(prizePoolId);
    if (prizePool) {
      res.status(200).json({
        message: "Prize pool fetched successfully",
        data: prizePool,
        status: 200,
      });
    } else {
      res.status(400).json({
        message: "Prize pool doesn't exist",
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

// Update Prize Pool
exports.updatePrizePool = async (req, res) => {
  const { prize, placements } = req.body;
  const prizePoolId = req.params.id;

  console.log(prize, "prize");
  console.log(req.body, "body");
  console.log(prizePoolId, "Pid");

  if (!prize) {
    return res.status(400).json({
      message: "Prize is empty !",
      status: 400,
    });
  }

  try {
    const prizePool = await PrizePool.findByPk(prizePoolId);

    if (prize) {
      prizePool.prize = prize;
    }
    prizePool.save();

    return res.status(200).json({
      message: "Prize pool updated successfully",
      data: prizePool,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

// delete prizepool
exports.deletePrizePool = async (req, res) => {
  const prizePoolId = req.params.id;
  console.log(prizePoolId, "prizePoolid");
  // return;

  try {
    const prizePool = await PrizePool.destroy({
      where: {
        id: prizePoolId,
      },
    });
    if (prizePool != 0) {
      return res.status(200).json({
        message: "Prize pool deleted successfully",
        status: 200,
      });
    } else {
      return res.status(400).json({
        message: "Prize pool doesn't exist or deleted already.",
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

exports.displayPrizePoolByTournamentId = async (req, res, next) => {
  const { tournamentId } = req.params;
  const prizePoolWithTournament = await PrizePool.findAll({
    where: { tournamentId },
  });

  const sortPrizePool = prizePoolWithTournament.sort(
    (a, b) => a.placements - b.placements
  );

  // console.log(JSON.stringify(sortPrizePool));
  return res.status(200).json(sortPrizePool);
};
