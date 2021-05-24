var express = require("express");
var router = express.Router();

router.get("../DataTypePages/Actors.html", function (req, res) {
  res.send("Actors.html");
});

module.exports = router;
