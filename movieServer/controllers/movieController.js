const Movie = require("../models/movies.js");

// exports.movieList = async function (req, res, next) {
//   try {
//     // let movieList = await Movie.find().sort("title").exec();
//     let movieList = require("../public/javascripts/movieData.js");
//     console.log(movieList);
//     res.render("movieList.ejs", { movies: movieList });
//   } catch (err) {
//     next(err);
//   }
// };

exports.movieList = async function (req, res, next) {
  try {
    let movieList = await Movie.find().sort("title").exec();
    res.render("movieList.ejs", { movies: movieList });
  } catch (err) {
    next(err);
  }
};

exports.movieById = async function (req, res, next) {
  try {
    let movie = await Movie.findById(req.params.id).populate("genres").exec();
    res.render("movie.ejs", { movie });
  } catch (err) {
    next(err);
  }
};
