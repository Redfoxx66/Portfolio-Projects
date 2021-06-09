var express = require("express");
var router = express.Router();

const Movie = require("../models/movies.js");
const Genre = require("../models/genres.js");
const Actor = require("../models/actors.js");
const { includes } = require("../public/javascripts/userData.js");

router.get("/", async (req, res) => {
  try {
    // let movies = await Movie.find().exec();
    let movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/title/:title", async (req, res) => {
  try {
    console.log("Original search value: ", req.params.title);
    let searchValue = req.params.title.trim().toLowerCase();
    console.log("lowercased and trimmed: ", searchValue);
    searchValue = searchValue.split(" ");
    for (let i = 0; i < searchValue.length; i++) {
      searchValue[i] = searchValue[i].charAt(0).toUpperCase() + searchValue[i].slice(1);
    }
    // console.log(searchValue);
    searchValue = searchValue.join(" ");
    console.log("value after capitalized: ", searchValue);
    let movie = await Movie.findOne().where("title").eq(searchValue);
    res.json(movie);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    if (Array.isArray(req.body)) {
      //do something for each movie
      let movie = req.body;
      let savedMovies = [];
      movie.forEach(async (value) => {
        let newMovie = await makeMovieObject(value, true);
        console.log(newMovie);
        savedMovies.push(newMovie);
      });
      res.json({ message: "multiple movies were created" });
    } else if (typeof req.body === "object") {
      console.log("about to make it to the call");
      let movieCreated = await makeMovieObject(req.body);
      res.json(movieCreated);
    } else {
      throw "no object or array of objects";
    }
  } catch (err) {
    res.json({ message: err });
  }
});

async function makeMovieObject(newMovie, multipleMovies = false) {
  let movie = new Movie({
    title: newMovie.title,
    director: newMovie.director,
  });

  let givenGenres = newMovie.genres;
  if (givenGenres === undefined) {
    givenGenres = [];
  } else {
    let genreHolder = [];
    for (let genre of givenGenres) {
      if (!isNaN(genre.charAt(0))) {
        let genreSearch = await Genre.findOne().where("_id").eq(genre);
        if (genreSearch) {
          genreHolder.push(genreSearch._id);
        }
      } else {
        let genreSearch = await Genre.findOne().where("title").eq(genre);
        if (genreSearch) {
          genreHolder.push(genreSearch._id);
        } else {
          let newGenre = new Genre({ title: genre });
          await newGenre.save();
          genreHolder.push(newGenre._id);
        }
      }
    }

    givenGenres.splice(0, givenGenres.length);
    givenGenres = genreHolder;
  }

  let actors = newMovie.cast;
  if (actors === undefined) {
    actors = [];
  } else {
    let newActors = [];
    for (let actor of actors) {
      if (!isNaN(actor.charAt(0))) {
        let actorSearch = await Actor.findOne().where("_id").eq(actor);
        if (actorSearch) {
          actorSearch.movies.push(movie._id);
          await actorSearch.save();
          newActors.push(actorSearch._id);
        }
      } else {
        let actorSearch = await Actor.findOne().where("name").eq(actor);
        if (actorSearch) {
          actorSearch.movies.push(movie._id);
          await actorSearch.save();
          newActors.push(actorSearch._id);
        }
      }
    }

    actors.splice(0, actors.length);
    actors = newActors;
  }

  movie.cast = actors;
  movie.releaseDate = newMovie.releaseDate;
  movie.rating = newMovie.rating;
  movie.genres = givenGenres;
  movie.country = newMovie.country;
  movie.language = newMovie.language;
  movie.duration = newMovie.duration;
  movie.img = newMovie.image;

  if (!multipleMovies) {
    try {
      const savedMovie = await movie.save();
      return savedMovie;
    } catch (error) {
      return { message: error };
    }
  } else {
    try {
      await movie.save();
    } catch (error) {
      return { message: error };
    }
  }
}

router
  .route("/movie/id/:id")
  .all((req, res, next) => {
    console.log("dealing with specific movie object");
    next();
  })
  .get(async (req, res) => {
    console.log("using get for specific movie object");
    try {
      let movie = await Movie.findById(req.params.id);
      res.json(movie);
    } catch (error) {
      res.json({ message: error });
    }
  })
  .delete(async (req, res) => {
    console.log("deleting specific movie object");
    try {
      const cast = await Actor.find().where("movies").eq(req.params.id).exec();
      for (let actor of cast) {
        let index = actor.movies.indexOf(req.params.id);
        if (index > -1) actor.movies.splice(index, 1);
        if (actor.movies.length === 0) actor.movies = [];
        actor.save();
      }

      const removeMovie = await Movie.findByIdAndDelete(req.params.id).exec();
      res.json(removeMovie);
    } catch (err) {
      res.json(err);
    }
  })
  .patch(async (req, res) => {
    console.log("updating specific movie object");
    try {
      let movie = await Movie.findById(req.params.id).populate(
        "cast genres",
        "name title"
      );
      console.log("movie to update: ", movie);

      let givenGenres = req.body.genres;
      if (givenGenres === undefined) {
        givenGenres = [];
      } else {
        let genreHolder = [];
        for (let genre of givenGenres) {
          if (!isNaN(genre.charAt(0))) {
            let genreSearch = await Genre.findOne().where("_id").eq(genre);
            if (genreSearch) {
              genreHolder.push(genreSearch._id);
            }
          } else {
            let genreSearch = await Genre.findOne().where("title").eq(genre);
            if (genreSearch) {
              genreHolder.push(genreSearch._id);
            } else {
              let newGenre = new Genre({ title: genre });
              await newGenre.save();
              genreHolder.push(newGenre._id);
            }
          }
        }

        givenGenres.splice(0, givenGenres.length);
        givenGenres = genreHolder;
      }

      movie.title = req.body.title;
      movie.director = req.body.director;

      let newActorSelection = req.body.cast;
      let newCast = [];

      if (req.body.cast !== undefined) {
        for (let actor of req.body.cast) {
          if (!isNaN(actor[0])) {
            console.log("this actor has an id: ", actor);
            let actorID = await Actor.findOne().where("_id").eq(actor);
            // console.log("here is the actor object: ", actorID);
            if (actorID) {
              if (!actorID.movies.includes(movie._id)) {
                actorID.movies.push(movie._id);
                await actorID.save();
              }
              newCast.push(actorID._id);
            }
          } else {
            console.log("this actor has a name declared: ", actor);
            let find = await Actor.findOne().where("name").eq(actor);
            // console.log("here is the actor object: ", find);

            if (find) {
              if (!find.movies.includes(movie._id)) {
                find.movies.push(movie._id);
                await find.save();
              }
              newCast.push(find._id);
            }
          }
        }
      }

      console.log("new cast after for each new actor function: ", newCast);

      let oldActors = await Actor.find().where("_id").eq(movie.cast);
      //   console.log("this is the list of old actors selcted", oldActors._id);
      for (let actor of oldActors) {
        console.log("Custom findindex: ", unSelected(newCast, actor._id));

        // console.log("should return false ", !newCast.includes(actor._id));
        // console.log("should return true: ", newCast.includes(actor._id));

        console.log("should return false ", newCast.indexOf(actor._id) === -1);
        console.log("should return true: ", newCast.indexOf(actor._id) !== -1);

        if (req.body.cast === undefined || newCast.includes(actor._id)) {
          console.log("Hey this actor was unselected: ", actor.name);
          let index = actor.movies.indexOf(movie._id);
          if (index > -1) actor.movies.splice(index, 1);
          if (actor.movies.length === 0) actor.movies = [];
          actor.save();
        }
      }

      movie.cast = newCast;
      movie.releaseDate = req.body.releaseDate;
      movie.rating = req.body.rating;
      movie.genres = givenGenres;
      movie.country = req.body.country;
      movie.language = req.body.language;
      movie.duration = req.body.duration;
      movie.img = req.body.img;

      let updatedMovie = await movie.save();
      res.json(updatedMovie);
    } catch (error) {
      res.json({ message: error });
    }
  });

function unSelected(newCast, oldId) {
  for (let i = 0; i < newCast.length; i++) {
    console.log(`Comparing values ${newCast[i]} === ${oldId}`);
    if (newCast[i] === oldId) {
      return i;
    }
  }

  return false;
}
module.exports = router;
