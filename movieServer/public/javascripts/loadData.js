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

  // const actorRecords = [];
  // const actorMap = new Map();

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
    const movieRecord = new Movie(movie);
    await movieRecord.save();
  }

  // for (let actor of actors) {
  // actorRecords.push(new Actors(actor));
  // }

  // const movieRecords = [];
  // const movieMap = new Map();

  // for (let movie of movies) {
  //   const movieRecord = new Movie(movie);
  //   await movieRecord.save();
  // movieRecords.push(movieRecord);
  // movieMap.set(movie.title, { cast: movie.cast });
  // }

  // // loop through all movies and for each movie loop through all actors to see if one matches the map,
  // // will make more efficient later
  // for (let i = 0; i < movieRecords.length; i++) {
  //   //array of actors for this movie
  //   let actors = movieMap.get(movieRecords[i].title).cast;
  //   for (let actor of actors) {
  //     for (let actorSearch of actorRecords) {
  //       if (actor === actorSearch.name) {
  //         movieRecords[i].cast.push(actorSearch._id);
  //         actorSearch.movies.push(movieRecords[i]._id);
  //       }
  //     }
  //   }
  // }

  // let combinedRecords = movieRecords.concat(actorRecords);
  // let promises = combinedRecords.map((record) => record.save());

  // let promises = actorRecords.map((record) => record.save());

  // combinedRecords.forEach(async (record) => {
  //   await record.save();
  // });

  // await Promise.all(promises);

  console.log("finished loading and should have saved.");

  //close connection here so for now so program can exit
  mongoose.connection.close();
}

loadMoviesandActors();
