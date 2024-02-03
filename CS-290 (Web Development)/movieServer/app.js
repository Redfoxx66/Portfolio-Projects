// var createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const movieAPIRoutes = require("./routes/movieAPI.js");
app.use("/movieAPI", movieAPIRoutes);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));

//Matthew Walker's needed packages and middlewares for API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const actorsRouter = require("./routes/actors");
app.use("/actors", actorsRouter);

const userRouter = require("./routes/user");
app.use("/DataTypePages/UserData", userRouter);

const movieRouter = require("./routes/movies");
app.use("/movies", movieRouter);

app.get("*", function (req, res) {
  res.status(404);
  let fileLoc = path.join(__dirname, "public", "404.html");
  res.sendFile(fileLoc);
});

//Use database with mongoose
const credentials = require("./public/javascripts/dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = app;
