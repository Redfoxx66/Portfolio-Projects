const user = require("../models/userModel.js");
//const movie = require("../models/movies.js");
//const actor = require("../models/actors.js");

const credentials = require("../public/javascripts/dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

exports.update_post = async function (req, res, next) {
  try {
    console.log("im here");
    let curUser = await user.findById(req.params.id).exec();
    if (curUser === null) {
      curUser = new user(req.body_id);
    }

    curUser.userName = req.body.userName;
    curUser.passWord = req.body.passWord;
    curUser.dateCreated = req.body.dateCreated;

    let movieList = req.body.favMovies.split("\n");
    for (let i = 0; i < movieList.length; i++) {
      movieList[i] = movieList[i].trim();
      if (movieList[i] === "") {
        movieList(i, 1);
        i--;
      }
    }
    curUser.favMovies = movieList;

    let actorList = req.body.favActorss.split("\n");
    for (let i = 0; actorList.length; i++) {
      actorList = actorList[i].trim();
      if (actorList[i] === "") {
        actorList.splice(i, 1);
        i--;
      }
    }
    curUser.favActors = actorList;

    await curUser.save();
    res.redirrect("../../");
  } catch (err) {
    console.log(err);
    next(err);
  }
};
