const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingEnum = require("../public/javascripts/ratingEnum.js");

const ratings = [];
for (let rating in ratingEnum) {
  ratings.push(ratingEnum[rating]);
}

let movieSchema = new Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  cast: [{ type: Schema.Types.ObjectId, ref: "Actor" }],
  releaseDate: { type: Date, required: true },
  rating: { type: String, require: true, enum: ratings },
  genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  country: { type: String },
  language: { type: String },
  duration: { type: Number, required: true }, //use as minutes and make virtual to calculate hours and mins
});

movieSchema.virtual("url").get(function () {
  return "/movies/id/" + this._id;
});

//might rename to date, this is to be release date it might have more than just the year it might not
movieSchema.virtual("date_short").get(function () {
  let date = this.releaseDate;
  date = date.toISOString().slice(0, 10);

  let year = date.slice(0, 4);
  let month = date.slice(5, 7);
  let day = date.slice(8, 10);

  if (month[0] === "0") month = month[1];

  if (day[0] === "0") day = day[1];

  let dateString = month + "/" + day + "/" + year;

  return dateString;
});

movieSchema.virtual("runTime").get(function () {
  const initialTime = this.duration;

  // look into making sure it is an even value no matter what, like doing int math in c++

  let minutes = initialTime;
  let hours = minutes / 60;

  let duration = "";

  if (hours > 1) {
    minutes = hours * 60 - minutes;
    duration = `${hours}h ${minutes}min`;
  } else duration = `${minutes}min`;

  return duration;
});

movieSchema.virtual("year").get(function () {
  const date = this.releaseDate;

  let dateString = date.getFullYear();
  return dateString;
});

module.exports = mongoose.model("Movie", movieSchema);
