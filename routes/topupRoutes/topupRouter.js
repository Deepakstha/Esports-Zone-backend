const {
  intitializeKhaltiPayment,
  checkKhaltiPayment,
  verifyKhaltiPayment,
  displayTopUp,
  displayAllUserTopUp,
} = require("../../controller/topup/topupController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const { givePermissionTo } = require("../../middleware/givePermission");
const catchAsync = require("../../utils/catchAsync");

const router = require("express").Router();

router.post(
  "/initialize-payment/:walletId",
  isAuthenticated,
  catchAsync(intitializeKhaltiPayment)
);

router.get("/checkPayment", isAuthenticated, checkKhaltiPayment);
router.get(
  "/verify-khalti-payment/:pidx",
  isAuthenticated,
  verifyKhaltiPayment
);

router.get("/view-topup", isAuthenticated, displayTopUp);
router.get(
  "/view-all-user-topup",
  isAuthenticated,
  givePermissionTo(["admin"]),
  catchAsync(displayAllUserTopUp)
);

module.exports = router;
