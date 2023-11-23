const router = require("express").Router();
const userController = require("../../controller/userController/userController");
const catchAsync = require("../../utils/catchAsync");

router.post("/signup", catchAsync(userController.signup));
router.get("/activation", catchAsync(userController.activateAccount));
router.post("/login", catchAsync(userController.login));

module.exports = router;
