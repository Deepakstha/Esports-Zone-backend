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
