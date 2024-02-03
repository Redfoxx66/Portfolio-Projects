const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var actorSchema = new Schema({
  name: { type: String, required: true },
  born: { type: String, required: true },
  image: { type: String},
  height: { type: Number },
  twitter: { type: String },
  movies: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
});

actorSchema.virtual("url").get(function () {
  return "/actors/id/" + this._id;
});

actorSchema.virtual("bornDate").get(function () {
  console.log(this.born)
  let date = this.born;
  if(this.born.length == 12){
    date = date.slice(0, 12);
    let year = date.slice(0, 6);
    let month = date.slice(7, 9);
    let day = date.slice(10, 12);
    let newDate = month + "/" + day + "/" + year;
    console.log(newDate);
    return newDate;
  }
  if(this.born.length == 11){  
    date = date.slice(0, 11);
    let year = date.slice(0, 5);
    let month = date.slice(7, 8);
    let day = date.slice(10, 11);
    let newDate = month + "/" + day + "/" + year;
    console.log(newDate);
    return newDate;
  }
  else{
  date = date.slice(0, 10);
  let year = date.slice(0, 4);
  let month = date.slice(5, 7);
  let day = date.slice(8, 10);
  let newDate = month + "/" + day + "/" + year;
  console.log(newDate);
  return newDate;
  }
});

actorSchema.virtual("twitterAccount").get(function () {
   console.log(this.twitter);
  if (this.twitter == null || this.twitter == "") {
    return "";
  }
  let linkCheck = this.twitter.slice(0, 20);
  if(linkCheck == "https://twitter.com/" ){
    return this.twitter;
  }
  return "https://twitter.com/" + this.twitter;
});

//Export model
module.exports = mongoose.model("Actor", actorSchema);
