jwt = require("jsonwebtoken");

exports.createToken = (user, secret, expireTime) => {
  return jwt.sign(user, secret, {
    expiresIn: expireTime,
  });
};
