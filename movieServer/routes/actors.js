var express = require("express");
var router = express.Router();

var actorController = require("../controllers/actorController.js");

router.get("/", actorController.actorList);

router.get("/id/:id", actorController.actorById);

router.get("/delete/:id", actorController.delete);

router.get("/create", actorController.create);

router.get("/update/:id", actorController.update_get);

router.post("/update/:id", actorController.update_post);

module.exports = router;
