const credentials = require("./dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//load models
const Movie = require("../../models/movies.js");
const Genre = require("../../models/genres.js");
const User = require("../../models/userModel.js");
const Actors = require("../../models/actors.js");

//load data objects
const movies = require("./movieData.js");
const actors = require("./actorData.js");
const users = require("./userData.js");
const ratingEnum = require("./ratingEnum.js");

async function loadMoviesandActorsandUsers() {
  await Movie.deleteMany();
  await Genre.deleteMany();
  await Actors.deleteMany();
  await User.deleteMany();

  //   // const actorMap = new Map();

  const actorRecords = [];
  for (let actor of actors) {
    const actorRecord = new Actors({
      name: actor.name,
      born: actor.born,
      height: actor.height,
      twitter: actor.twitter,
      image: actor.image,
    });
    actorRecord.movies = [];

    actorRecords.push(actorRecord);
  }

  const movieRecords = [];
  const movieMap = new Map();
  const genreMap = new Map();

  for (let movie of movies) {
    const movieRecord = new Movie({
      title: movie.title,
      director: movie.director,
    });

    movieRecord.cast = [];
    movieMap.set(movie.title, { cast: movie.cast });

    movieRecord.releaseDate = movie.releaseDate;
    switch (movie.rating) {
      case "G":
        movieRecord.rating = ratingEnum.G;
        break;

      case "PG":
        movieRecord.rating = ratingEnum.PG;
        break;

      case "U":
        movieRecord.rating = ratingEnum.U;
        break;

      case "R":
        movieRecord.rating = ratingEnum.R;
        break;

      default:
        movieRecord.rating = ratingEnum.PG13;
        break;
    }

    for (let genre of movie.genres) {
      //if genre doesn't exist make a new one and save it to the map
      if (!genreMap.has(genre)) {
        let newGenre = new Genre({ title: genre });
        await newGenre.save();
        genreMap.set(genre, newGenre);
      }
      movieRecord.genres.push(genreMap.get(genre));
      //same thing just more visual for logging
      //   movieRecord.genres.push(genreMap.get(genre)._id);
    }

    movieRecord.country = movie.country;
    movieRecord.language = movie.language;
    movieRecord.duration = movie.duration;
    movieRecord.img = movie.image;

    movieRecords.push(movieRecord);
  }

  for (let movie of movieRecords) {
    let actors = movieMap.get(movie.title).cast;
    for (let actor of actors) {
      for (let actorSearch of actorRecords) {
        if (actor === actorSearch.name) {
          movie.cast.push(actorSearch._id);
          actorSearch.movies.push(movie._id);
        }
        movie.update(actorSearch._id);
        actorSearch.update(movie._id);
      }
    }
  }

  //optional alternate way to print movie records (not as pretty no color)
  //   console.log(`movie records to save:\n${movieRecords}`);

  // console.log(`movie records to save:`);
  // console.log(movieRecords);

  // console.log("\nactor records to save:");
  // console.log(actorRecords);

  let combinedRecords = movieRecords.concat(actorRecords);
  let promises = combinedRecords.map((record) => record.save());
  await Promise.all(promises);

  console.log("\nfinished loading movies");
  console.log("finished loading actors");

  for (let user of users) {
    const curUser = new User({
      userName: user.userName,
      passWord: user.passWord,
      dateCreated: user.dateCreated,
    });
    for (let curMovie of user.favMovies) {
      // console.log(curMovie);
      let movie = await Movie.findOne().where("title").equals(curMovie).exec();
      // console.log(movie);
      curUser.favMovies.push(movie._id);
    }
    for (let curActor of user.favActors) {
      let actor = await Actors.findOne().where("name").equals(curActor).exec();
      // console.log(actor);
      curUser.favActors.push(actor._id);
    }

    await curUser.save();
    // console.log(curUser);
  }

  console.log("finished loading users\nEverything loaded sucssesfully");

  mongoose.connection.close();
}

loadMoviesandActorsandUsers();
