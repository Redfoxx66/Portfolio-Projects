const routeHelper = require("../routes/routeHelper.js");

const Movie = require("../models/movies.js");
const Actor = require("../models/actors.js");
const Genre = require("../models/genres.js");

const ratingEnum = require("../public/javascripts/ratingEnum.js");

const ratings = [];
for (let rating in ratingEnum) {
  ratings.push(ratingEnum[rating]);
}

exports.movieList = async function (req, res, next) {
  try {
    let movieList = await Movie.find().sort("title").exec();
    res.render("movieList.ejs", { movies: movieList });
    // res.json(movieList);
  } catch (err) {
    next(err);
  }
};

exports.movieById = async function (req, res, next) {
  try {
    let movie = await Movie.findById(req.params.id)
      .populate("cast genres", "name title")
      .exec();
    console.log(movie);
    res.render("movie.ejs", movie);
  } catch (err) {
    next(err);
  }
};

exports.genereList = async function (req, res, next) {
  try {
    let genreList = await Genre.find().sort("title").exec();
    res.render("genres.ejs", { genres: genreList });
  } catch (err) {
    next(err);
  }
};

exports.genre = async function (req, res, next) {
  try {
    let genre = await Genre.findById(req.params.id).exec();
    let movies = await genre.movies;
    res.render("genre.ejs", { genre: genre, movies: movies });
  } catch (err) {
    next(err);
  }
};

//should be basically working make sure to remove testing logs later
exports.delete = async function (req, res, next) {
  try {
    const cast = await Actor.find().where("movies").eq(req.params.id).exec();
    console.log("Cast to remove movie from: ", cast);
    for (let actor of cast) {
      console.log("actors array of movies: ", actor.movies);
      console.log("this movie id to remove: ", req.params.id);
      let index = actor.movies.indexOf(req.params.id);
      if (index > -1) actor.movies.splice(index, 1);
      if (actor.movies.length === 0) actor.movies = [];
      console.log("new actor movie array: ", actor.movies);
      actor.save();
    }
    await Movie.findByIdAndDelete(req.params.id).exec();
    res.redirect("/movies/");
  } catch (err) {
    next(err);
  }
};

exports.delete_genre = async function (req, res, next) {
  try {
    let movies = await Movie.find().where("genres").eq(req.params.id).exec();
    for (let movie of movies) {
      console.log("Movies to erase genre from: ", movie.title);
    }
    for (let movie of movies) {
      console.log(`${movie.title}'s array of genres: `, movie.genres);
      console.log("this genre id to remove: ", req.params.id);
      let index = movie.genres.indexOf(req.params.id);
      if (index > -1) movie.genres.splice(index, 1);
      if (movie.genres.length === 0) movie.genres = [];
      console.log(`${movie.title}'s new genre array: `, movie.genres);
      movie.save();
    }
    await Genre.findByIdAndDelete(req.params.id).exec();
    res.redirect("/movies/genres");
  } catch (err) {
    next(err);
  }
};

exports.create = async function (req, res, next) {
  try {
    let movie = new Movie({});

    const genreObjs = await Genre.find().select("title").sort("title").exec();
    const actorObjs = await Actor.find().select("name").sort("name").exec();

    console.log(ratings);
    res.render("movieForm.ejs", {
      title: "Create Movie",
      movie: movie,
      genreObjs: genreObjs,
      actorObjs: actorObjs,
      ratings: ratings,
    });
  } catch (err) {
    next(err);
  }
};

//Handles getting an editable form with movie data
exports.update_get = async function (req, res, next) {
  try {
    let movie = await Movie.findById(req.params.id).exec();

    //Load in all genres but may want to provide text box to add more genres if desired
    const genreObjs = await Genre.find().select("title").sort("title").exec();
    const actorObjs = await Actor.find().select("name").sort("name").exec();

    console.log(genreObjs);

    res.render("movieForm.ejs", {
      title: `Update ${movie.title}`,
      movie: movie,
      genreObjs: genreObjs,
      actorObjs: actorObjs,
      ratings: ratings,
    });
  } catch (err) {
    next(err);
  }
};

//Use express-validator to remove harmful content
const { body } = require("express-validator");

//Handles submission of the form
///look over this for sure look at escaped values and all that
exports.update_post = [
  //First HTML escape all the text inputs
  body("title").escape(),
  body("director").escape(),
  body("extraGenres").escape(),
  body("duration").escape(),
  body("country").escape(),
  body("language").escape(),
  body("image").escape(),

  async function (req, res, next) {
    try {
      //Get movie if it exists
      let movie = await Movie.findById(req.params.id).exec();
      //If the movie doesn't exist make a new one
      if (movie === null)
        movie = new Movie({
          _id: req.body.id,
        });

      let declaredGenres = req.body.genres;
      if (declaredGenres === undefined) declaredGenres = [];

      // need map or array that holds values and make sure that there is only one value
      const genreMap = new Map();

      //take all "new genres" make sure they don't exist and create new genres and build up the list of refrences
      let newGenres = req.body.extraGenres.split("\n");
      for (let i = 0; i < newGenres.length; i++) {
        newGenres[i] = newGenres[i].trim();
        if (newGenres[i] === "") {
          //Delete empty item
          newGenres.splice(i, 1);
          i--;
        } else if (genreMap.has(newGenres[i])) {
          //Delete repeat item
          newGenres.splice(i, 1);
          i--;
        } else {
          let searchGenre = await Genre.findOne().where("title").eq(newGenres[i]).exec();
          if (searchGenre === null) {
            let newGenre = new Genre({ title: newGenres[i] });
            await newGenre.save();

            genreMap.set(newGenres[i], newGenre);
            newGenres[i] = await Genre.findOne().where("title").eq(newGenres[i]).exec();
          } else {
            //delete already declared item
            newGenres.splice(i, 1);
            i--;
          }
        }
      }

      movie.title = req.body.title;
      movie.director = req.body.director;

      //go to each actor and link up their movies if the movie hasn't been added before
      let actors = await Actor.find().where("_id").eq(req.body.actors).exec();
      // console.log("Found actor objects to link: ", actors);
      for (let actor of actors) {
        if (!actor.movies.includes(movie._id)) {
          // console.log(`Movie not present for ${actor.name} so adding this movie`);
          actor.movies.push(movie._id);
          await actor.save();
        }
      }

      //if updating a movie and unselecting a previously linked actor, unlink on actor end
      if (movie.cast.length > 0) {
        let oldActors = await Actor.find().where("_id").eq(movie.cast).exec();
        console.log("this is the list of actors selcted", req.body.actors);
        for (let actor of oldActors) {
          //repetitive see if can do anything about
          if (
            req.body.actors === undefined ||
            !req.body.actors.includes(String(actor._id))
          ) {
            console.log("Hey this actor was unselected: ", actor.name);
            let index = actor.movies.indexOf(movie._id);
            if (index > -1) actor.movies.splice(index, 1);
            if (actor.movies.length === 0) actor.movies = [];
            actor.save();
          }
          // else if (!req.body.actors.includes(String(actor._id))) {
          //   console.log("Hey this actor was unselected: ", actor.name);
          //   let index = actor.movies.indexOf(movie._id);
          //   if (index > -1) actor.movies.splice(index, 1);
          //   if (actor.movies.length === 0) actor.movies = [];
          //   actor.save();
          // }
        }
      }

      if (req.body.actors === undefined) movie.cast = [];
      else movie.cast = req.body.actors;

      // movie.cast = req.body.actors;
      movie.releaseDate = req.body.releaseDate;
      movie.rating = req.body.rating;
      movie.genres = declaredGenres.concat(newGenres);
      movie.country = req.body.country;
      movie.language = req.body.language;
      movie.duration = req.body.duration;
      movie.img = req.body.image;

      const genreObjs = await Genre.find().select("title").exec();
      const actorObjs = await Actor.find().select("name").sort("name").exec();

      movie
        .save()
        .then((movie) => {
          //Success, redirect to details view of the movie
          res.redirect(movie.url);
        })
        .catch((err) => {
          //Problem, show the form with error messages
          console.log(err.message);
          res.render("movieForm.ejs", {
            title: `Update ${movie.title}`,
            movie: movie,
            genreObjs: genreObjs,
            ratings: ratings,
            actorObjs: actorObjs,
            errors: routeHelper.errorParser(err.message),
          });
        });
    } catch (err) {
      next(err);
    }
  },
];
