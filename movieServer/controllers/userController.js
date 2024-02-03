const user = require("../models/userModel.js");
const movie = require("../models/movies.js");
const actor = require("../models/actors.js");

const credentials = require("../public/javascripts/dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

exports.update_post = async function (req, res, next) {
  try {
    console.log("I am here \n" + req.body.username);

    let curUser = await user.findById(req.params.id).exec();
    if (curUser === null) {
      curUser = new user(req.body_id);
    }

    console.log(curUser.dateCreated);

    curUser.userName = req.body.userName;
    curUser.passWord = req.body.passWord;
    curUser.dateCreated = req.body.dateCreated;

    let movieList = req.body.favMovies;
    // for (let i = 0; i < movieList.length; i++) {
    //     movieList[i] = movieList[i].trim();
    //     if (movieList[i] === "") {
    //         movieList.splice(i, 1);
    //         i--;
    //     }
    // }

    //UPDATE LATER
    // for (let i = 0; i < movieList.length; i++) {
    //     if (movieList[i] == "Spirited Away") {
    //         movieList[i] = await movie.findOne().where("title").eq(movieList[i]);
    //     } else {
    //         movieList[i] = await movie.findOne().where("title").eq(movieList[i] + " ");
    //     }
    // }

    curUser.favMovies = movieList;
    console.log("list should be here" + movieList);
    let actorList = req.body.favActors;
    // for (let j = 0; j < actorList.length; j++) {
    //     actorList[j] = actorList[j].trim();
    //     if (actorList[j] === "") {
    //         actorList.splice(j, 1);
    //         j--;
    //     }
    // }

    // for (let i = 0; i < actorList.length; i++) {
    //     actorList[i] = await actor.findOne().where("name").eq(actorList[i]);
    // }
    curUser.favActors = actorList;

    curUser.save().then(() => {
      //res.json({ file: req.file });
      res.redirect("../../users");
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.update_delete = async function (req, res, next) {
  try {
    let curUser = await user.findById(req.params.id).exec();
    if (curUser === null) {
      throw err("That user doesn't exist!");
    }
    user.findByIdAndDelete(curUser._id).then(() => {
      res.redirect("../../users");
    });
    console.log("Deleted user");
  } catch (err) {
    console.log(err);
    next(err);
  }
};
