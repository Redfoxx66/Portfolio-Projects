var express = require("express");
var router = express.Router();

const credentials = require("../public/javascripts/dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const user = require("../models/userModel.js");

router.get("/users", async function (req, res) {
  const userList = await user.find().sort("userName");
  res.render("userMulti.ejs", {
    userList: userList,
  });
});

router.get("/users/:id", async function (req, res) {
  const curUser = await user.findById(req.params.id);
  res.render("userSingle.ejs", {
    user: curUser,
  });
});

router.get("/users/:id/favoritemovies", async function (req, res) {
  const curUser = await user.findById(req.params.id);
  res.render("userFavMovies.ejs", {
    moviesList: curUser.favMovies,
  });
});

router.get("/users/:id/favoriteactors", async function (req, res) {
  const curUser = await user.findById(req.params.id);
  res.render("userFavActors.ejs", {
    actorsList: curUser.favActors,
  });
});

module.exports = router;
