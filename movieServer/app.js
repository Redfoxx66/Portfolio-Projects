// var createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

//Matthew Walker's needed packages and middlewares for API
//most likely used this way
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const movieAPIRoutes = require("./routes/movieAPI.js");
app.use("/movieAPI", movieAPIRoutes);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//set the path of the jquery file to be used from the node_module jquery package
// app.use("/jquery", express.static(path.join(__dirname + "/node_modules/jquery/dist/")));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

//Not using vanilla 404 router below

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// // error handler
// app.use(function(err, req, res) {
//     // // set locals, only providing error in development
//     // res.locals.message = err.message;
//     // res.locals.error = req.app.get("env") === "development" ? err : {};

//     // // render the error page
//     // res.status(err.status || 500);
//     // let fileLoc = path.join(__dirname, "public", "404.html");
//     // res.sendFile(fileLoc);
//     //res.status = 404;
//     let fileLoc = path.join(__dirname, 'public', '404.html')
//     res.sendFile(fileLoc);
// });

module.exports = app;
