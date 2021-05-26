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
  {
    title: "Funny Movie ",
    director: "Hayao Miy",
    cast: ["quinn", "Someone Super", "Noel"],
    releaseDate: Date.parse("2661"),
    rating: "G",
    genres: ["skip", "ship", "hip", "dip", "quip"],
    country: "Merca",
    language: "gish",
    duration: 195,
  },
  {
    title: "Why Bother ",
    director: "Evile Mike",
    cast: ["Layla", "George Super important", "No one"],
    releaseDate: Date.parse("2021"),
    rating: "R",
    genres: ["hip", "horror", "horray"],
    country: "gina",
    language: "mount",
    duration: 200,
  },
];

module.exports = Movies;
