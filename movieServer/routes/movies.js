var express = require("express");
var router = express.Router();
var path = require("path");

const movieController = require("../controllers/movieController.js");

// router.get("/", function(req, res) {
//     res.send("Movies.html");
// });

router.get("/", movieController.movieList);

// router.get("/:title/:id", );

router.get("*", async (req, res) => {
  //res.status = 404;
  let fileLoc = path.join(__dirname, "..", "public", "404.html");
  res.sendFile(fileLoc);
});

module.exports = router;
