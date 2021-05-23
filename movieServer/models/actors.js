const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var actorSchema = new Schema({
  name: { type: String, required: true },
  born: { type: String, required: true },
  height: { type: Number },
  twitter: { type: String },
  movies: [{ type: Schema.Types.ObjectId, ref: "Movies" }],
});

actorSchema.virtual("url").get(function () {
  return "/actor/id/" + this._id;
});

//Export model
module.exports = mongoose.model("Actor", actorSchema);
