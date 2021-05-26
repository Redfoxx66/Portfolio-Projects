var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// var indexRouter = require("./routes/index");
// app.use("/", indexRouter);

const actorsRouter = require("./routes/actors");
app.use("/DataTypePages/Actors", actorsRouter);

const userRouter = require("./routes/user");
app.use("/DataTypePages/UserData", userRouter);

const movieRouter = require("./routes/movies");
app.use("/movies", movieRouter);

app.get("*", function(req, res) {
    res.status(404);
    let fileLoc = path.join(__dirname, 'public', '404.html')
    res.sendFile(fileLoc);
})

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