const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

const accessControl = (req, res, next) => {
  const origin = req.headers.origin;
  console.log(origin);
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = accessControl;
