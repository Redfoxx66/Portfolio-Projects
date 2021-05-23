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

userSchema.virtual("url").get(function () {
  return "users/id/" + this._id;
});

userSchema.virtual("age").get(function () {
  //Just need to figure out how to get the age
});

module.exports = mongoose.model("User", userSchema);
