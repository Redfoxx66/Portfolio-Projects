const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingEnum = require("../public/javascripts/ratingEnum.js");

const ratings = [];
for (let rating in ratingEnum) {
  ratings.push(ratingEnum[rating]);
}

let movieSchema = new Schema({
  title: {
    type: String,
    required: [true, "A title must be provided"],
    validate: [
      function (value) {
        let match = value.search(/\w/);
        return match !== -1;
      },
      "A title must have at least one character",
    ],
  },
  director: {
    type: String,
    required: [true, "A director must be provided"],
    validate: [
      function (value) {
        let match = value.search(/[a-zA-Z]/);
        return match !== -1;
      },
      "A director's name must have at least one letter",
    ],
  },
  cast: [{ type: Schema.Types.ObjectId, ref: "Actor" }],
  releaseDate: {
    type: Date,
    default: Date.now(),
    required: [true, "Must have a valid release date"],
  },
  rating: { type: String, require: true, enum: ratings },
  genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  country: { type: String },
  language: { type: String },
  duration: {
    type: Number,
    required: [true, "A duration must be provided"],
    min: [1, "Minimum duration is 1 minute"],
  },
  img: { type: String },
});

movieSchema.virtual("url").get(function () {
  return "/movies/id/" + this._id;
});

movieSchema.virtual("date").get(function () {
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

movieSchema.virtual("parsable_date").get(function () {
  let date = this.releaseDate;
  return date.toISOString().slice(0, 10);
});

movieSchema.virtual("runTime").get(function () {
  const initialTime = this.duration;

  let minutes = initialTime;
  let hours = Math.floor(minutes / 60);

  let duration = "";

  if (hours >= 1) {
    minutes = initialTime - hours * 60;
    if (minutes === 0) {
      hours > 1 ? (duration = `${hours} hours`) : (duration = `${hours} hour`);
    } else {
      duration = `${hours}h ${minutes}min`;
    }
  } else duration = `${minutes} minutes`;

  return duration;
});

movieSchema.virtual("parsable_duration").get(function () {
  const initialTime = this.duration;

  let minutes = initialTime;
  let hours = Math.floor(minutes / 60);
  minutes = initialTime - hours * 60;

  let duration = `PT${hours}H${minutes}M`;

  return duration;
});

// movieSchema.virtual("year").get(function () {
//   const date = this.releaseDate;

//   let dateString = date.getFullYear();
//   return dateString;
// });

module.exports = mongoose.model("Movie", movieSchema);
