var express = require("express");
var router = express.Router();
var path = require("path");

const movieController = require("../controllers/movieController.js");

router.get("/", movieController.movieList);

router.get("/id/:id", movieController.movieById);

router.get("/genres", movieController.genereList);

router.get("/genres/id/:id", movieController.genre);

router.get("/delete/genres/id/:id", movieController.delete_genre);

router.get("/delete/:id", movieController.delete);

router.get("/create", movieController.create);

router.get("/update/:id", movieController.update_get);

router.post("/update/:id", movieController.update_post);

router.get("*", async (req, res) => {
  //res.status = 404;
  let fileLoc = path.join(__dirname, "..", "public", "404.html");
  res.sendFile(fileLoc);
});

module.exports = router;
