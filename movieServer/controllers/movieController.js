const Movie = require("../models/movies.js");
const Actor = require("../models/actors.js");
const Genre = require("../models/genres.js");

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
    let movie = await Movie.findById(req.params.id).populate("cast", "name").exec();
    console.log(movie);
    res.render("movie.ejs", movie);
  } catch (err) {
    next(err);
  }
};

exports.create = async function (req, res, next) {
  try {
    let movie = new Movie({});

    //Load in all genres but may want to provide text box to add more genres if desired
    let genreObjs = await Genre.find().select("title").sort("title").exec();
    let actors = await Actor.find().select("name").sort("name").exec();

    const ratingEnum = require("../public/javascripts/ratingEnum.js");

    const ratings = [];
    for (let rating in ratingEnum) {
      ratings.push(ratingEnum[rating]);
    }

    console.log(ratings);
    res.render("movieForm.ejs", {
      title: "Create Movie",
      movie: movie,
      genreObjs: genreObjs,
      actors: actors,
      ratings: ratings,
    });
  } catch (err) {
    next(err);
  }
};

// //Handles getting an editable form with movie data
// exports.update_get = async function (req, res, next) {
//   try {
//     const ratingEnum = require("../public/javascripts/consolesEnum.js");

//     const consoles = [];
//     for (let console in ratingEnum) {
//       consoles.push(ratingEnum[console]);
//     }

//     let movie = await Movie.findById(req.params.id).exec();
//     //Load in all genres but may want to provide text box to add more genres if desired
//     let genreObjs = await Genre.find().select("title").sort("title").exec();

//     console.log(genreObjs);

//     res.render("gameForm.ejs", {
//       title: `Update ${movie.title}`,
//       movie: movie,
//       genreObjs: genreObjs,
//       consoles: consoles,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //Use express-validator to remove harmful content
// const { body } = require("express-validator");

// //Handles submission of the form
// exports.update_post = [
//   //First HTML escape all the text inputs
//   body("title").escape(),
//   body("developers").escape(),
//   body("extraGenres").escape(),

//   async function (req, res, next) {
//     try {
//       //If movie exists in DB, fetch it
//       let movie = await Movie.findById(req.params.id).exec();
//       //If not, make one
//       if (movie === null)
//         movie = new Movie({
//           _id: req.body.id,
//         });

//       let declaredGenres = req.body.genres;
//       if (declaredGenres === undefined) declaredGenres = [];

//       // need map or array that holds values and make sure that there is only one value
//       const genreMap = new Map();

//       //take all "new genres" make sure they don't exist and create new genres and build up the list of refrences
//       let newGenres = req.body.extraGenres.split("\n");
//       for (let i = 0; i < newGenres.length; i++) {
//         newGenres[i] = newGenres[i].trim();
//         if (newGenres[i] === "") {
//           //Delete empty item
//           newGenres.splice(i, 1);
//           i--;
//         } else if (genreMap.has(newGenres[i])) {
//           //Delete repeat item
//           newGenres.splice(i, 1);
//           i--;
//         } else {
//           let searchGenre = await Genre.findOne().where("title").eq(newGenres[i]).exec();
//           if (searchGenre === null) {
//             let newGenre = new Genre({ title: newGenres[i] });
//             await newGenre.save();

//             genreMap.set(newGenres[i], newGenre);
//             newGenres[i] = await Genre.findOne().where("title").eq(newGenres[i]).exec();
//           } else {
//             //delete already declared item
//             newGenres.splice(i, 1);
//             i--;
//           }
//         }
//       }

//       movie.title = req.body.title;
//       movie.developers = req.body.developers;
//       movie.releaseDate = req.body.releaseDate;
//       movie.genres = declaredGenres.concat(newGenres);
//       movie.consoles = [].concat(req.body.consoles);

//       const genreObjs = await Genre.find().select("title").exec();
//       const ratingEnum = require("../public/javascripts/consolesEnum.js");

//       const consoles = [];
//       for (let console in ratingEnum) {
//         consoles.push(ratingEnum[console]);
//       }

//       movie
//         .save()
//         .then((movie) => {
//           //Success, redirect to details view of the movie
//           res.redirect(movie.url);
//         })
//         .catch((err) => {
//           //Problem, show the form with error messages
//           console.log(err.message);
//           res.render("gameForm.ejs", {
//             title: `Update ${movie.title}`,
//             movie: movie,
//             genreObjs: genreObjs,
//             consoles: consoles,
//             errors: routeHelper.errorParser(err.message),
//           });
//         });
//     } catch (err) {
//       next(err);
//     }
//   },
// ];
