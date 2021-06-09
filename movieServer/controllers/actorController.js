const Actor = require("../models/actors");
const Movie = require("../models/movies");
const user = require("../models/userModel.js");


//list of things to do still
// router.get("/delete/:id", actorFunctions.delete);
// router.get("/create", actorFunctions.create);
// router.get("/update/:id", actorFunctions.update_get);
// router.post("/update/:id", actorFunctions.update_post);

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

//This must also delete for movie and user one
exports.delete = async function (req, res, next) {
  try {
    await Actor.findByIdAndDelete(req.params.id).exec();
    res.redirect("/actors");
  } catch (err) {
    next(err);
  }
};

//This should also populate in movies and users
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


      





      actor.name = req.body.name;
      actor.born = req.body.born;
      actor.height = req.body.height;
      actor.twitter = req.body.twitter;
      actor.movies = req.body.movies !== "" ? req.body.movies : undefined;

      let movies = await Movie.find().select("title").exec();

      actor.save().then((actor) => {
          res.redirect(actor.url);
        })
        .catch((err) => {
          console.log(err.message);
          res.render("actorForm.ejs", {
            title: `Update ${actor.name}`,
            actor: actor,
            movies: movies,
            // errors: routeHelper.errorParser(err.message),
          });
        });
    } catch (err) {
      next(err);
    }
  },
];
