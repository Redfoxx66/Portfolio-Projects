const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const Actors =

const ratingEnum = require("../public/javascripts/ratingEnum.js");

const ratings = [];
for (let rating in ratingEnum) {
  ratings.push(ratingEnum[rating]);
}

//not sure about what the actor schema looks like yet
//might have ratings be enum might just change to string later not sure
// let movieSchema = new Schema({
//   title: { type: String, required: true },
//   director: { type: String, required: true },
//   cast: [{ type: Schema.Types.ObjectId, ref: "Actor" }],
//   releaseDate: { type: Date, required: true },
//   rating: { type: String, require: true, enum: ratings }, // not sure enum would be effective or necessary
//   genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }], //want to access genres seprately so might be good to have as a seperate object
//   country: { type: String },
//   language: { type: String },
//   duration: { type: Number, required: true }, //use as minutes and make virtual to calculate hours and mins
// });

let movieSchema = new Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  cast: [{ type: Schema.Types.ObjectId, ref: "Actor" }],
  releaseDate: { type: Date, required: true },
  rating: { type: String, require: true }, // not sure enum would be effective or necessary
  genres: [{ type: String }], //want to access genres seprately so might be good to have as a seperate object
  country: { type: String },
  language: { type: String },
  duration: { type: Number, required: true }, //use as minutes and make virtual to calculate hours and mins
});

movieSchema.virtual("url").get(function () {
  return "/movie/id/" + this._id;
});

//might rename to date, this is to be release date it might have more than just the year it might not
movieSchema.virtual("date_short").get(function () {
  const date = this.releaseDate;

  let dateString = date.getMonth() + 1 + "/" + date.getDay() + "/" + date.getFullYear();
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

module.exports = mongoose.model("Movie", movieSchema);
