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

router.get("/actors", async function (req, res) {
  const actorList = await Actor.find().sort("name");
  res.render("actorList.ejs", { actorList: actorList });
});

router.get("/actors/:id", async function (req, res) {
  const actor = await Actor.findById(req.params.id);
  res.render("actor.ejs", {
    Actor: actor,
  });
});

module.exports = router;
