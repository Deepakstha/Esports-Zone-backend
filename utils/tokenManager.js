jwt = require("jsonwebtoken");

exports.createToken = (data, secret, expireTime) => {
  return jwt.sign(data, secret, {
    expiresIn: expireTime,
  });
};

exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
