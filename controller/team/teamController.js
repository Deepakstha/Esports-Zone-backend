const db = require("../../model");
const fs = require("fs");
const Teams = db.teams;
const TeamPlayers = db.teamPlayers;

exports.createTeams = async (req, res, next) => {
  const userId = req.user.id;
  const { teamName, maxPlayers } = req.body;

  if (!teamName) {
    return res.status(400).json({
      message: "Team Name Required.",
      status: 400,
    });
  }
  if (!maxPlayers) {
    return res
      .status(400)
      .json({ message: "Please Insert maximum players in the team" });
  }
  if (!req.file) {
    return res.status(400).json({
      message: "Please Insert team logo.",
      status: 400,
    });
  }
  try {
    const teamNames = await Teams.findOne({ where: { teamName: teamName } });
    if (teamNames) {
      res
        .status(409)
        .json({ message: "Team name Already Exists ", status: 409 });
    } else {
      const filename = req.file.filename;

      const filePath = `uploads/teamsLogo/${filename}`;

      const slugField = teamName
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      const createTeams = await Teams.create({
        teamName,
        logo: filePath,
        maxPlayers: maxPlayers,
        userId: userId,
        slug: slugField,
      });
      if (createTeams) {
        const teamId = createTeams.id;
        console.log(teamId);
        await TeamPlayers.create({
          userId: userId,
          teamId: teamId,
          role: "leader",
        });

        return res.status(200).json({
          message: "Team created successfully.",
          status: 200,
          createTeams,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    next(error);
  }
};

//display teams by user id (leader)
exports.displayTeamsByUserId = async (req, res, next) => {
  const userId = req.user.id;
  const teamsByUser = await Teams.findAll({ where: { userId } });
  return res.json({ teams: teamsByUser });
};

// get teams by id
exports.getById = async (req, res, next) => {
  const teamId = req.params.id;

  try {
    const teams = await Teams.findOne({
      where: { id: teamId },
      include: { model: db.user, attributes: ["username", "fullname"] },
    });

    if (!teams) {
      return res.status(404).json({ message: "Teams Not Found", status: 404 });
    }
    return res.status(200).json({ teams, status: 200 });
  } catch (error) {
    next(error);
  }
};
