const customErrorHandler = require("../utils/customerErrorHandler");

exports.givePermissionTo = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const errorMessage = "You don't have permission to do that action";
      return next(customErrorHandler(403, errorMessage));
    }
    next();
  };
};
