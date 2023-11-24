const db = require("../../model");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const User = require("../../model").user;
const { createToken, verifyToken } = require("../../utils/tokenManager");
const customeErrorHandler = require("../../utils/customerErrorHandler");
const { accountActivationMail } = require("../../services/sendMail");

exports.signup = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  if (!fullname) return next(customeErrorHandler(400, "Fullname is required"));
  if (!email) return next(customeErrorHandler(400, "Email is required"));
  if (!password) return next(customeErrorHandler(400, "Password is required"));

  let userEmailExist = await User.findOne({ where: { email } });

  if (userEmailExist) {
    // const filename = req.file.filename;
    // console.log(filename, "filename..---");
    // const filePath = `uploads/avatar/${filename}`;
    // console.log(filePath, "filePath..---");

    // fs.unlink(filePath, (error) => {
    //   if (error) {
    //     console.log(error);
    //     res.status(500).json({ message: "Error deleting file" });
    //   } else {
    //     res.json({
    //       message: "File Deleted Successfully",
    //     });
    //     console.log("File Deleted");
    //   }
    // });
    return next(customeErrorHandler(400, "User Already Registered"));
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

  const activationUrl = `${req.headers.origin}/user/activation?token=${activationToken}`;
  res
    .status(200)
    .json({ message: "Verification mail has been sent to your email" });
  await accountActivationMail({
    email: user.email,
    subject: "Activate Your Account",
    fullname: user.fullname,
    token: activationUrl,
  });
  return;
};

// activate user
exports.activateAccount = async (req, res, next) => {
  // const { activationToken } = req.body;
  const { activationToken } = req.params;
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

// Login controller
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return next(customeErrorHandler(400, "Email field is Empty"));
  if (!password)
    return next(customeErrorHandler(400, "Password Field is empty"));

  const foundUser = await User.findOne({
    where: {
      email,
    },
  });
  if (!foundUser) {
    if (!foundUser) return next(customeErrorHandler(401, "wrong credentials!"));
  }

  const matchPassword = bcrypt.compareSync(password, foundUser.password);
  if (!matchPassword)
    return next(customeErrorHandler(401, "wrong credentials!!"));

  let token = createToken(
    { id: foundUser.id },
    process.env.JWT_SECRET,
    process.env.BROWSER_COOKIES_EXPIRES_IN
  );
  // Saving the token generated for user to cookie
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      message: "Login successful",
      token: token,
      id: foundUser.id,
      username: foundUser.username,
      fullName: foundUser.fullName,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar,
      status: 200,
    });
};

// send reset password link controller
exports.sendResetPasswordLink = async (req, res) => {
  const email = req.body.email;
  const userFound = await User.findAll({
    where: {
      email: email,
    },
  });
  if (userFound.length != 0) {
    const resetToken = createToken(
      { id: userFound[0].id },
      process.env.PASSWORD_RESET_SECRET,
      "1d"
    ).toString();
    const resetURL = `${req.headers.origin}/reset-password?reset_token=${resetToken}`;

    try {
      await passwordResetMail({
        email: userFound[0].email,
        subject: "Reset your password",
        token: resetURL,
      });
      return res
        .status(201)
        .json({ message: "Please Check your email", status: 201 });
    } catch (error) {
      return res.json({ message: error.message, status: 500 });
    }
  } else {
    res.status(500).json({
      message: "User is not registered.",
      status: 500,
    });
  }
};

// reset password controller
exports.resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password != confirmPassword) {
    return res.status(400).json({ message: "Password doesnot match" });
  }
  const newPassword = bcrypt.hashSync(password, 10);
  const token = req.params.reset_token;
  const userId = verifyToken(token, process.env.PASSWORD_RESET_SECRET);

  const user = await User.findOne({
    where: {
      id: userId.id,
    },
  });
  if (user) {
    //updating the password to new password
    user.password = newPassword;
    user.save();
    res.status(201).json({
      message: "Password changed successfully.",
      status: 201,
    });
  } else {
    res.status(400).json({
      message: "User not found.",
      status: 400,
    });
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, password } = req.body;
  const newPassword = await bcrypt.hash(password, 10);
  const user = await User.findOne({
    where: {
      id: userId,
    },
  });

  if (bcrypt.compareSync(currentPassword, user.password)) {
    if (user) {
      user.password = newPassword;
      user.save();
      return res.status(200).json({
        message: "Password changed successfully.",
        status: 200,
      });
    } else {
      return res.status(400).json({
        message: "User not found.",
        status: 400,
      });
    }
  } else {
    return res.status(400).json({ message: "Current Password is incorrect" });
  }
};

// logout controller
exports.doLogout = async (req, res) => {
  //clear the cookie stored in the browser
  res.clearCookie("token");
  res.status(200).json({
    message: "Logged out successfully.",
    status: 200,
  });
};

//display all users
exports.displayAllUsers = async (req, res, next) => {
  const users = await User.findAll({
    attributes: ["username", "fullname", "email", "avatar", "wins"],
  });

  return res.status(200).json({ users, status: 200 });
};

// getProfile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({
    where: userId,
    attributes: [
      "id",
      "username",
      "fullname",
      "email",
      "avatar",
      "tournamentsPlayed",
      "wins",
      "bio",
    ],
  });
  if (!user) {
    return res.status(400).json({ message: "User not Found!", status: 400 });
  }

  const userWallet = await db.wallet.findOne({
    where: { userId },
    attributes: ["id", "balance"],
  });
  const inGameId = await db.inGameId.findAll({
    where: { userId },
    attributes: ["id", "playerId"],
    include: [{ model: db.games, attributes: ["gameName"] }],
  });
  return res.status(200).json({ user, userWallet, inGameId, status: 200 });
};

// display bio
exports.displayUserBio = async (req, res) => {
  const userId = req.user.id;
  const userBio = await User.findByPk(userId, { attributes: ["bio"] });
  return res.json(userBio);
};

// update user bio
exports.updateUserBio = async (req, res) => {
  const userId = req.user.id;
  const { bio } = req.body;
  const user = await User.findByPk(userId);
  user.bio = bio;
  await user.save();
  return res.status(200).json(user.bio);
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, username } = req.body;
  // if (!fullName || !username) {
  //   return res.status(400).json({ message: "Please insert required Field" });
  // }

  const user = await User.findOne({
    where: userId,
    attributes: ["id", "username", "fullName", "email", "avatar"],
  });

  if (!user) {
    return res.json({ message: "User not Found", status: 400 });
  }

  if (req.file) {
    let filePath;
    const keys = user.avatar.split("/").pop(); // taking image name
    if (keys != "avatar.png") {
      deleteFromS3(keys);
    }
    await uploadToS3(req.file)
      .then((result) => {
        filePath = result.Location;
      })
      .catch((error) => {
        console.log(error.message);
      });
    user.avatar = filePath;
  }

  if (fullName) {
    user.fullName = fullName;
  }

  if (username) {
    user.username = username;
  }
  user.save();

  return res
    .status(200)
    .json({ message: "Profile Updated!", status: 200, user });
};
