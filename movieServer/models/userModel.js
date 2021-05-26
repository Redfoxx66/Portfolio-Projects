const mongoose = require("mongoose");
//const Actors = require("./actors.js");
//const Movies = require("./movies.js");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: { type: String },
    passWord: { type: String },
    dateCreated: { type: Date },
    favMovies: [{ type: Schema.Types.ObjectId, ref: "Movies" }],
    favActors: [{ type: Schema.Types.ObjectId, ref: "Actors" }],
});

userSchema.virtual("url").get(function() {
    return "users/" + this._id;
});

userSchema.virtual("age").get(function() {
    const curDate = Date.now();
    const difference = Math.abs(curDate - this._dateCreated);
    const days = difference % (1000 * 60 * 60 * 24);
    const hours = (difference - (days * 24 * 60 * 60 * 1000)) % (1000 * 60 * 60);

    return (days + " days" + hours + " hours");
});

module.exports = mongoose.model("User", userSchema);