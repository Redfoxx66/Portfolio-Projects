const Movies = [
  {
    title: "Spirited Away",
    director: "Hayao Miyazaki",
    cast: ["Someone", "Someone Super important", "No one"],
    releaseDate: Date.parse("2001"),
    rating: "PG",
    genres: ["yay, hip hip horray"], //want to access genres seprately so might be good to have as a seperate object
    country: "Japan",
    language: "Japanese",
    duration: 125, //use as minutes and make virtual to calculate hours and mins
  },
];

module.exports = Movies;
