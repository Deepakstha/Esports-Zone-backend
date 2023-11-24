const jwt = require("jsonwebtoken");
const user = require("../model").user;
const util = require("util");
const promisify = util.promisify;
const customErrorHandler = require("../utils/customerErrorHandler");
module.exports = async (req, res, next) => {
  // const token = req.cookies.token;
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer "))
    return next(customErrorHandler(406, "Not Authenticated, Please Login"));

  const token = authorization.split(" ")[1];

  if (!token)
    return next(customErrorHandler(406, "Not Authenticated, Please Login!!"));

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const walletId = decoded.walletId;

    const loggedUser = await user.findByPk(decoded.id);

    if (!loggedUser) {
      res.status(502).json({
        message:
          "token is verifyed but user doesn't exist on our database. Please try again by loggin out.",
        status: 502,
      });
    } else {
      const loggedUserDetails = {
        id: loggedUser.id,
        username: loggedUser.username,
        fullName: loggedUser.fullName,
        email: loggedUser.email,
        role: loggedUser.role,
      };

      // Add the logged user object to req object
      req.user = loggedUserDetails;
      req.walletId = walletId;
      next();
    }
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return next(customErrorHandler(502, "Token expired!!"));
    } else if (error.name === "JsonWebTokenError") {
      return next(customErrorHandler(502, "Invalid token!"));
    } else {
      next(error);
    }
  }
};
