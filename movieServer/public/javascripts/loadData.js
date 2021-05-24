const credentials = require("./dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//load models
const Movie = require("../../models/movies.js");
const User = require("../../models/userModel.js");
const Actors = require("../../models/actors.js");

//load data objects
const movies = require("./movieData.js");
const actors = require("./actorData.js");

async function loadMoviesandActors() {
  await Movie.deleteMany();
  await Actors.deleteMany();

  for (let actor of actors) {
    const actorRecord = new Actors({
      name: actor.name,
      born: actor.born,
      height: actor.height,
      twitter: actor.twitter,
      // movies: actor.movies,
    });
    actorRecord.movies = [];

    await actorRecord.save();
  }

  for (let movie of movies) {
    const movieRecord = new Movie({
      title: movie.title,
      director: movie.director,
    });
    for (let castMember of movie.cast) {
      console.log(castMember);
      let actor = await Actors.find().where("name").equals(castMember).exec();
      console.log(actor);
      //need to link up movies to actors afterwards
      movieRecord.cast = actor;
    }
    movieRecord.releaseDate = movie.releaseDate;
    //may use enum here
    movieRecord.rating = movie.rating;
    // movieRecord.genres fix this up to work later
    movieRecord.genres = ["fantasy", "mystery"];
    movieRecord.country = movie.country;
    movieRecord.language = movie.language;
    movieRecord.duration = movie.duration;

    await movieRecord.save();

    let allActors = await Actors.find().exec();
  }

  // for (let actor of actors) {
  //     const actorRecord = new Actors({
  //         name: actor.name,
  //         born: actor.born,
  //         height: actor.height,
  //         twitter: actor.twitter,
  //         // movies: actor.movies,
  //     });
  //     let movies = await Movie.find().where("cast").equals(actor._id).exec();
  //     actorRecord.movies = movies;

  //     await actorRecord.save();
  // }

  //close connection here so for now so program can exit
  mongoose.connection.close();
}

loadMoviesandActors();
