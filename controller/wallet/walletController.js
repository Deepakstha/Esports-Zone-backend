const Wallet = require("../../model").wallet;

exports.createWallet = async (userId) => {
  try {
    const wallet = await Wallet.create({
      userId: userId,
    });
    return { success: true, wallet };
  } catch (error) {
    return { success: false, error };
  }
};

exports.getUserWallet = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const userWallet = await Wallet.findOne({
      where: {
        userId: userId,
      },
    });
    if (userWallet) {
      res.status(200).json({
        message: "Wallet found !",
        data: userWallet,
      });
    } else {
      res.status(400).json({
        message: "Wallet of the user not found !",
      });
    }
  } catch (error) {
    next(error);
  }
};
