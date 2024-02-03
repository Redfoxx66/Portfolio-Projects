var express = require("express");
var router = express.Router();
var path = require("path");

/* GET home page. */
router.get("/", function (req, res) {
  let fileLoc = path.join(__dirname, "..", "public", "index.html");
  res.sendFile(fileLoc);
});

router.get("*", async (req, res) => {
  res.status = 404;
  let fileLoc = path.join(__dirname, "..", "public", "404.html");
  res.sendFile(fileLoc);
});

module.exports = router;
