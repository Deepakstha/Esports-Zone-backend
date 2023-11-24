const router = require("express").Router();
const userController = require("../../controller/userController/userController");
const catchAsync = require("../../utils/catchAsync");
const { givePermissionTo } = require("../../middleware/givePermission");
const isAuthenticated = require("../../middleware/isAuthenticated");
const { avatar } = require("../../services/multer");

router.post("/signup", catchAsync(userController.signup));
router.get("/activation", catchAsync(userController.activateAccount));
router.post("/login", catchAsync(userController.login));
router.post("/reset", catchAsync(userController.sendResetPasswordLink));
router.post("/reset/:reset_token", catchAsync(userController.resetPassword));
router.post(
  "/change-password",
  isAuthenticated,
  catchAsync(userController.changePassword)
);
router.get("/logout", catchAsync(userController.doLogout));
router
  .route("/update-profile")
  .get(catchAsync(isAuthenticated), catchAsync(userController.getProfile))
  .post(
    catchAsync(isAuthenticated),
    avatar.single("avatar"),
    catchAsync(userController.updateProfile)
  );

router.get(
  "/all-users",
  catchAsync(isAuthenticated),
  givePermissionTo(["admin"]),
  catchAsync(userController.displayAllUsers)
);

router
  .route("/bio")
  .get(isAuthenticated, catchAsync(userController.displayUserBio))
  .patch(isAuthenticated, catchAsync(userController.updateUserBio));

module.exports = router;
