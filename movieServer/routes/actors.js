var express = require("express");
var router = express.Router();

const Actor = require("../models/actors");

// router.get("../DataTypePages/Actors.html", function (req, res) {
//   res.send("Actors.html");
// });

router.get("/", async function (req, res) {
  let actorList = await Actor.find().sort("name").exec();
  //pass an object with one property, the heroList
  res.render("actorList.ejs", { actorList });
});

router.get("/id/:id", async function (req, res) {
  const actor = await Actor.findById(req.params.id).populate("movies", "title").exec();
  console.log(actor);
  res.render("actor.ejs", actor);
});

module.exports = router;
