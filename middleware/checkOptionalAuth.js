const jwt = require("jsonwebtoken");
const user = require("../model").user;
const util = require("util");
const promisify = util.promisify;
const customErrorHandler = require("../utils/customerErrorHandler");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer "))
    return next(customErrorHandler(406, "Not Authenticated, Please Login"));

  const token = authorization.split(" ")[1];
  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      const walletId = decoded.walletId;

      const loggedUser = await user.findByPk(decoded.id);
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
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Handle token expiration, e.g., by sending a response indicating the token has expired
        return res
          .status(401)
          .json({ message: "Token expired. Please log in again." });
      } else {
        // Handle other errors
        return next(customErrorHandler(500, "Internal Server Error"));
      }
    }
  } else {
    next();
  }
};
