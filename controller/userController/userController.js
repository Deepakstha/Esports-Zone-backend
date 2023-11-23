const db = require("../../model");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const User = require("../../model").user;
const { createToken, verifyToken } = require("../../utils/tokenManager");
const customeErrorHandler = require("../../utils/customerErrorHandler");

exports.signup = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  if (!fullname) return next(customeErrorHandler(400, "Fullname is required"));
  if (!email) return next(customeErrorHandler(400, "Email is required"));
  if (!password) return next(customeErrorHandler(400, "Password is required"));

  let userEmailExist = await User.findOne({ where: { email } });

  if (userEmailExist) {
    const filename = req.file.filename;
    console.log(filename, "filename..---");
    const filePath = `uploads/avatar/${filename}`;
    console.log(filePath, "filePath..---");

    fs.unlink(filePath, (error) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting file" });
      } else {
        res.json({
          message: "File Deleted Successfully",
        });
        console.log("File Deleted");
      }
    });
    return next(customerErrorHandler(400, "User Already Registered"));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    fullname,
    email,
    password: hashedPassword,
  };

  const activationToken = createToken(
    user,
    process.env.ACTIVATION_SECRET,
    "5m"
  ).toString();

  const activationUrl = `${req.headers.origin}/activation?token=${activationToken}`;
  const resp = await sendMail({
    email: user.email,
    subject: "Activate Your Account",
    full: user.fullname,
    token: activationUrl,
  });
  res
    .status(resp.status)
    .json({ message: resp.message, success: resp.success });
};

// activate user
exports.activateAccount = async (req, res, next) => {
  const { activationToken } = req.body;
  if (!activationToken) {
    return res.status(400).json({ message: "Invallid Token!" });
  }

  let decode = verifyToken(activationToken, process.env.ACTIVATION_SECRET);
  if (!decode) {
    return res.status(400).json({ message: "Invallid Token!" });
  }
  const { fullname, email, password } = decode;
  const userEmailExist = await User.findOne({ where: { email } });
  if (userEmailExist) {
    return res
      .status(401)
      .json({ message: "User Already Registered!", status: 401 });
  }

  let randomNumber = Math.floor(Math.random() * 10000);
  const firstName = fullname.split(" ")[0];
  const user = await User.create({
    fullname,
    username: firstName + randomNumber,
    email,
    password,
  });

  if (user) {
    return res.json({ message: "User Registered" });
  }
};
