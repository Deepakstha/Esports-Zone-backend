const multer = require("multer");
// const path = require("path")

//Multer for Avatar
const storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatar/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const filename = file.originalname.split(".")[0];
    const fileExtension = file.originalname.split(".").pop();
    cb(null, filename + "-" + uniqueSuffix + "." + fileExtension);
  },
});

//for gamesImage files
const gamesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "gameCoverImage") {
      cb(null, "uploads/games/gameCoverImage/");
    }
    if (file.fieldname === "gameIcon") {
      cb(null, "uploads/games/gameIcon/");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    const fileExtension = file.originalname.split(".").pop();
    cb(null, filename + "-" + uniqueSuffix + "." + fileExtension);
  },
});

//Multer for Tournament
const storagTournament = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "tournamentIcon") {
      cb(null, "uploads/tournament/tournamentIcon/");
    }
    if (file.fieldname === "tournamentCover") {
      cb(null, "uploads/tournament/tournamentCover/");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    const fileExtension = file.originalname.split(".").pop();
    cb(null, filename + "-" + uniqueSuffix + "." + fileExtension);
  },
});
//Multer for Team logo
const teamLogo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/teamsLogo/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const filename = file.originalname.split(".")[0];
    const fileExtension = file.originalname.split(".").pop();
    cb(null, filename + "-" + uniqueSuffix + "." + fileExtension);
  },
});

// Multer for website Logo
const storageWebsiteLogo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/websiteLogo");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    const fileExtension = file.originalname.split(".").pop();
    cb(null, filename + "-" + uniqueSuffix + "." + fileExtension);
  },
});

// File Filtering
const fileFilter = function (req, file, cb) {
  // Check file types and allow only .png, .jpeg, and .jpg
  const allowedFileTypes = [".png", ".jpg", ".jpeg"];
  const fileExtension = file.originalname.split(".").pop().toLowerCase();
  if (allowedFileTypes.includes("." + fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only .png, .jpg, and .jpeg files are allowed."
      )
    );
  }
};

// Exporting
exports.avatar = multer({ storage: storageAvatar, fileFilter: fileFilter });
let tournament = multer({
  storage: storagTournament,
  fileFilter: fileFilter,
});
exports.tournamentUpload = tournament.fields([
  { name: "tournamentIcon" },
  { name: "tournamentCover" },
]);
let gamesImages = multer({ storage: gamesStorage, fileFilter: fileFilter });
exports.gamesImagesUpload = gamesImages.fields([
  { name: "gameCoverImage" },
  { name: "gameIcon" },
]);

exports.teamLogo = multer({ storage: teamLogo, fileFilter: fileFilter });

exports.websiteLogo = multer({
  storage: storageWebsiteLogo,
  fileFilter: fileFilter,
});
