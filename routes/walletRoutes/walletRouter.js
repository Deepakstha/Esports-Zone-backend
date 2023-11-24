const walletController = require("../../controller/wallet/walletController");
const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");

router.route("/get-all").get(walletController.getAllWallets);

router
  .route("/")
  .get(isAuthenticated, catchAsync(walletController.getUserWallet))
  .delete(isAuthenticated, catchAsync(walletController.deleteWallet));

module.exports = router;
