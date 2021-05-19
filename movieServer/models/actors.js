const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ActorSchema = new Schema({
    name: { type: String, required: true },
    born: { type: String, required: true },
    height: { type: Number },
    twitter: { type: String, },
    movies: [{ type: Schema.Types.ObjectId, ref: "Movies" }],
    users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  });  

  ActorSchema.virtual("url").get(function () {
  return "/Actor/id/" + this._id;
});

//Export model
module.exports = mongoose.model("Actor", ActorSchema);
