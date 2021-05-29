var express = require("express");
var router = express.Router();
var path = require("path");

const movieController = require("../controllers/movieController.js");

router.get("/", movieController.movieList);

router.get("/id/:id", movieController.movieById);

router.get("/create", movieController.create);

// router.get("/:title/:id", movieController.movie);

router.get("*", async (req, res) => {
  //res.status = 404;
  let fileLoc = path.join(__dirname, "..", "public", "404.html");
  res.sendFile(fileLoc);
});

module.exports = router;
