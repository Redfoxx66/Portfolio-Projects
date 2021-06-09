const Actor = require("../models/actors");
const Movie = require("../models/movies");
const user = require("../models/userModel.js");

exports.actorList = async function (req, res, next) {
  try {
    let actorList = await Actor.find().sort("name").exec();
    res.render("actorList.ejs", { actorList });
  } catch (err) {
    next(err);
  }
};

exports.actorById = async function (req, res, next) {
  try {
    let actor = await Actor.findById(req.params.id).populate("movies", "title").exec();
    console.log(actor);
    res.render("actor.ejs", actor);
  } catch (err) {
    next(err);
  }
};

exports.delete = async function (req, res, next) {
  try {
    await Actor.findByIdAndDelete(req.params.id).exec();
    res.redirect("/actors");
  } catch (err) {
    next(err);
  }
};

exports.create = async function (req, res, next) {
  try {
    let actor = new Actor({});
    let movies = await Movie.find().select("title").sort("title").exec();

    res.render("actorForm.ejs", {
      title: "Create Actor",
      actor: actor,
      movies: movies,
    });
  } catch (err) {
    next(err);
  }
};

exports.update_get = async function (req, res, next) {
  try {
    let actor = await Actor.findById(req.params.id).exec();
    let movies = await Movie.find().select("title").exec();
    res.render("actorForm.ejs", {
      title: `Update ${actor.name}`,
      actor: actor,
      movies: movies,
    });
  } catch (err) {
    next(err);
  }
};

exports.update_post = [
  async function (req, res, next) {       
    try {
      let actor = await Actor.findById(req.params.id).exec();
      console.log(actor);
      if (actor === null)
      actor = new Actor({
          _id: req.body.id,
        });
      console.log("req.body");
      console.log(req.body);
      let movies = await Movie.find().where("_id").eq(req.body.movies).exec();
      for (let m of movies) {
        if (!m.cast.includes(actor._id)) {
          m.cast.push(actor._id);
          await m.save();
        }
      }
           if (actor.movies.length > 0) {
            let oldMovies = await Movie.find().where("_id").eq(actor.movies).exec();
            console.log("Movies selcted", req.body.movies);
            for (let m of oldMovies) {
              if (
                req.body.movies === undefined ||
                !req.body.movies.includes(String(m._id))
              ) {
                console.log("Movie unselected: ", m.title);
                console.log("actorID:", actor._id);
                if(m.actors != undefined){
                console.log(m.actors);
                let index = m.actors.indexOf(actor._id);
                if (index > -1) m.actors.splice(index, 1);
                if (m.actors.length === 0) movie.cast = [];
                m.save();
              }
            }
            }
          }
      actor.name = req.body.name;
      actor.born = req.body.born;
      actor.image = req.body.image;
      actor.height = req.body.height;
      actor.twitter = req.body.twitter;
      actor.movies = req.body.movies !== "" ? req.body.movies : undefined;

      movies = await Movie.find().select("title").exec();

      actor.save().then((actor) => {
          res.redirect(actor.url);
        })
        .catch((err) => {
          console.log(err.message);
          res.render("actorForm.ejs", {
            title: `Update ${actor.name}`,
            actor: actor,
            movies: movies,
          });
        });
    } catch (err) {
      next(err);
    }
  },
];
