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

  const actorRecords = [];
  // const actorMap = new Map();

  for (let actor of actors) {
    const actorRecord = new Actors(actor);
    actorRecords.push(actorRecord);

    // actorMap.set(actor.name, { movies: actor.movies });
  }

  const movieRecords = [];
  const movieMap = new Map();

  for (let movie of movies) {
    const movieRecord = new Movie(movie);
    movieRecords.push(movieRecord);
    movieMap.set(movie.title, { cast: movie.cast });
  }

  for (let i = 0; i < movieRecords.length; i++) {
    //array of actors for this movie
    let actors = movieMap.get(movieRecords[i].title).cast;
    console.log(actors);
    for (let actor of actors) {
      for (let actorSearch of actorRecords) {
        if (actor === actorSearch.name) {
          movieRecords[i].cast.push(actorSearch._id);
          actorSearch.movies.push(movieRecords[i]._id);
        }
      }
    }
  }

  console.log(movieRecords);
  console.log(actorRecords);

  //close connection here so for now so program can exit
  mongoose.connection.close();
}

loadMoviesandActors();
