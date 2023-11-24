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
