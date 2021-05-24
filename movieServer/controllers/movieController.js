const Movie = require("../models/movies.js");

exports.movieList = async function (req, res, next) {
  try {
    let movieList = await Movie.find().sort("title").exec();
    res.render("movieList.ejs", Movie);
  } catch (err) {
    next(err);
  }
};

exports.movie = async function (req, res, next) {
  try {
  } catch (error) {}
};
