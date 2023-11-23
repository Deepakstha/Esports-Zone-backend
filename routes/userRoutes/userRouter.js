const router = require("express").Router();
const userController = require("../../controller/userController/userController");
const catchAsync = require("../../utils/catchAsync");

router.post("/signup", catchAsync(userController.signup));

module.exports = router;
