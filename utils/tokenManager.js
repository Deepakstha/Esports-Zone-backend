jwt = require("jsonwebtoken");

exports.createToken = (user, secret, expireTime) => {
  return jwt.sign(user, secret, {
    expiresIn: expireTime,
  });
};

exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
