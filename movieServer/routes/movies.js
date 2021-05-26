var express = require("express");
var router = express.Router();
var path = require("path");

// const movieController = require("../controllers/movieController.js");
const Movie = require("../models/movies.js");

// router.get("/", movieController.movieList);
router.get("/", async function (req, res) {
  let movieList = await Movie.find().sort("title").exec();
  console.log(movieList);
  res.render("movieList.ejs", { movies: movieList });
});

router.get("/id/:id", async function (req, res) {
  let movie = await Movie.findById(req.params.id).exec();
  console.log(movie);
  res.render("movie.ejs", movie);
});

// router.get("/:title/:id", movieController.movie);

// router.get("/id/:id", movieController.gameById);

router.get("*", async (req, res) => {
  //res.status = 404;
  let fileLoc = path.join(__dirname, "..", "public", "404.html");
  res.sendFile(fileLoc);
});

module.exports = router;
