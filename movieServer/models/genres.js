const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let genreSchema = new Schema({
  title: { type: String, required: true },
});

genreSchema.virtual("url").get(function () {
  return "/movies/genres/id/" + this._id;
});

genreSchema.virtual("delete_url").get(function () {
  return "/movies/delete/genres/id/" + this._id;
});

genreSchema.virtual("movies").get(async function () {
  const Movie = require("./movies");

  let movies = await Movie.find()
    .where("genres")
    .eq(this._id)
    .sort("title")
    .select("title")
    .exec();

  return movies;
});

module.exports = mongoose.model("Genre", genreSchema);
