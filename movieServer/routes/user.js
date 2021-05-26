var express = require("express");
var router = express.Router();

const credentials = require("../public/javascripts/dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Movies = require("../models/movies.js");
const Actors = require("../models/actors.js");
const user = require("../models/userModel.js");

router.get("/users", async function(req, res) {
    const userList = await user.find().sort("userName");
    res.render("userMulti.ejs", {
        userList: userList,
    });
});

router.get("/users/:id", async function(req, res) {
    const curUser = await user.findById(req.params.id);
    //Need to collect favorite movies
    let moviesList = [];
    for (let i = 0; i < curUser.favMovies.length; i++) {
        var curMovie = await Movies.findById(curUser.favMovies[i]);
        moviesList.push(curMovie);
    }
    //Need to collect favorite actors
    let actorsList = [];
    for (let i = 0; i < curUser.favActors.length; i++) {
        var curActor = await Actors.findById(curUser.favActors[i]);
        actorsList.push(curActor);
    }
    res.render("userSingle.ejs", {
        user: curUser,
        moviesList: moviesList,
        actorsList: actorsList,
    });
});

router.get("*", async(req, res) => {
    //res.status = 404;
    let fileLoc = path.join(__dirname, '..', 'public', '404.html')
    res.sendFile(fileLoc);
})

module.exports = router;