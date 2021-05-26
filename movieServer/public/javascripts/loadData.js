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
const users = require("./userData.js");
const Users = require("./userData.js");

async function loadMoviesandActorsandUsers() {
    await Movie.deleteMany();
    await Actors.deleteMany();
    await User.deleteMany();

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
            // console.log(castMember);
            let actor = await Actors.find().where("name").equals(castMember).exec();

            //console.log(actor);
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

        //console.log(movieRecord);

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
    //mongoose.connection.close();

    for (let user of users) {
        const curUser = new User({
            userName: user.userName,
            passWord: user.passWord,
            dateCreated: user.dateCreated,
        });
        for (let curMovie of user.favMovies) {
            let movie = await Movie.find().where("title").equals(curMovie).exec();
            //console.log(movie[0]);
            curUser.favMovies.push(movie[0]._id);
        }
        for (let curActor of user.favActors) {
            let actor = await Actors.find().where("name").equals(curActor).exec();
            //console.log(actor);
            curUser.favActors.push(actor[0]._id);
        }

        await curUser.save();
        console.log(curUser);
    }
    mongoose.connection.close();
}
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

// async function loadUsers() {
//     await User.deleteMany();
//     await loadMoviesandActors();
//     for (let user of users) {
//         const curUser = new User({
//             userName: user.userName,
//             passWord: user.passWord,
//             dateCreated: user.dateCreated,
//         });
//         for (let curMovie of user.favMovies) {
//             let movie = await Movie.find().where("title").equals(curMovie).exec();
//             //console.log(movie[0]);
//             curUser.favMovies.push(movie[0]._id);
//         }
//         for (let curActor of user.favActors) {
//             let actor = await Actors.find().where("name").equals(curActor).exec();
//             //console.log(actor);
//             curUser.favActors.push(actor[0]._id);
//         }

//         await curUser.save();
//         console.log(curUser);
//     }
//     mongoose.connection.close();
// }

loadMoviesandActorsandUsers();
//loadUsers();