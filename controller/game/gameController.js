const fs = require("fs");
const { promises } = require("fs");
const db = require("../../model");

const Games = db.games;

// Create Games
exports.createGames = async (req, res, next) => {
  const { gameName } = req.body;

  console.log(req.files.gameCoverImage[0].fieldname, "HLSLDHLCOVER");
  console.log(req.files.gameIcon[0].fieldname, "HLSLDHLICON");

  const gameCoverImage = req.files.gameCoverImage[0].fieldname;
  const gameIcon = req.files.gameIcon[0].fieldname;
  let coverImageUrl = `uploads/games/gameCoverImage/${gameCoverImage}`;
  let iconfileUrl = `uploads/games/gameIcon/${gameIcon}`;

  if (!gameName) {
    return res.status(400).json({
      message: "Game Name is Required",
      status: 400,
    });
  }
  if (!gameCoverImage) {
    return res
      .status(400)
      .json({ message: "Please insert game cover image file" });
  }
  if (!gameIcon) {
    return res.status(400).json({ message: "Please Insert game icon file" });
  }

  try {
    const gameNameExists = await Games.findOne({
      where: { gameName },
    });

    if (gameNameExists) {
      fs.unlink(coverImageUrl, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("File Deleted");
        }
      });
      fs.unlink(iconfileUrl, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("File Deleted");
        }
      });
      return res
        .status(400)
        .json({ message: "Game already exist", status: 400 });
    } else {
      const createGames = await Games.create({
        gameName,
        gameCoverImage: coverImageUrl,
        gameIcon: iconfileUrl,
      });

      if (createGames) {
        return res.status(200).json({
          message: "Games Created Sucessfull",
          createGames,
          status: 200,
        });
      } else {
        return res.status(200).json({
          message: "Not created",
        });
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    next(error);
  }
};

//getGamesById
exports.getById = async (req, res, next) => {
  const gameid = req.params.id;

  try {
    const game = await Games.findOne({ where: { id: gameid } });
    if (!game) {
      return res.status(404).json({ message: "Game not found", status: 404 });
    }

    return res.status(200).json({ game, status: 200 });
  } catch (error) {
    next(error);
  }
  ``;
};

//for update
exports.updateGameById = async (req, res, next) => {
  const gameId = req.params.id;
  const { gameName } = req.body;

  if (!gameName) {
    res.status(400).json({
      error: "Fill the required fields",
      status: 400,
    });
    return;
  }

  try {
    let game = await Games.findOne({ where: { id: gameId } });

    if (!game) {
      return res.status(404).json({ message: "Game not found", status: 404 });
    }

    // Update the game's information
    game.gameName = gameName;

    // Check if a new cover image or icon is provided
    if (req.files["gameCoverImage"]) {
      const newCoverImageUrl = `uploads/games/gameCoverImage/${req.files["gameCoverImage"][0].filename}`;
      game.gameCoverImage = newCoverImageUrl;
    }

    if (req.files["gameIcon"]) {
      const newIconImageUrl = `uploads/games/gameIcon/${req.files["gameIcon"][0].filename}`;
      game.gameIcon = newIconImageUrl;
    }

    // Save the updated game to the database
    await game.save();

    return res
      .status(200)
      .json({ message: "Game updated successfully", game, status: 200 });
  } catch (error) {
    console.error("Error:", error.message);
    next(error);
  }
};

//DeleteGames
exports.deleteGameById = async (req, res, next) => {
  const gameId = req.params.id;

  try {
    const game = await Games.findOne({ where: { id: gameId } });

    if (!game) {
      return res.status(404).json({ message: "Game not found", status: 404 });
    }

    const gameIconPath = game.gameIcon;
    const gameCoverImagePath = game.gameCoverImage;
    // Delete the game entry from the database

    const deletedGames = await game.destroy();
    if (deletedGames) {
      try {
        if (fs.existsSync(gameIconPath)) {
          promises.unlink(gameIconPath, (error) => {
            if (error) {
              console.error(error);
              res
                .status(500)
                .json({ message: "Error deleting file", status: 500 });
            } else {
              res.json({
                message: "File Deleted Successfully",
              });
              console.log("File Deleted Icon");
            }
          });
        } else {
          console.log("Icon not found");
        }
        if (fs.existsSync(gameCoverImagePath)) {
          promises.unlink(gameCoverImagePath, (error) => {
            if (error) {
              console.error(error);
              res.status(500).json({ message: "Error deleting file" });
            } else {
              res.json({
                message: "File Deleted Successfully",
              });
              console.log("File Deleted Cover");
            }
          });
        } else {
          console.log("Cover not found");
        }
      } catch (error) {
        console.log(error);
      }
    }
    return res
      .status(200)
      .json({ message: "Game deleted successfully", status: 200 });
  } catch (error) {
    console.error("Error:", error.message);
    next(error); // Pass the error to the error-handling middleware
  }
};

//GetAllGames
exports.getAllGames = async (req, res, next) => {
  try {
    const allGames = await Games.findAll();

    if (allGames.length === 0) {
      res.json({ message: "No games Available !!!", status: 204 });
    } else {
      return res
        .status(200)
        .json({ message: "List of Available games", allGames, status: 200 });
    }
  } catch (error) {
    console.error("Error:", error.message);
    next(error); // Pass the error to the error-handling middleware
  }
};
