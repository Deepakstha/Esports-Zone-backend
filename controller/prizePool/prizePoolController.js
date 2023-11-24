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
