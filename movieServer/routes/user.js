var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const cyrpto = require('crypto');



const credentials = require("../public/javascripts/dbCredentials.js");
const mongoose = require("mongoose");
mongoose.connect(credentials.connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const conn = mongoose.createConnection(credentials.connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('userImages');
});

const storage = new GridFsStorage({
    url: credentials,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'userImages'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });




const Movies = require("../models/movies.js");
const Actors = require("../models/actors.js");
const user = require("../models/userModel.js");

const userController = require("../controllers/userController.js");
const actors = require("../models/actors.js");

router.get("/users", async function(req, res) {
    const userList = await user.find().sort("userName");
    res.render("userMulti.ejs", {
        userList: userList,
    });
});

router.get("/users/create", async function(req, res) {
    let newUser = new user();
    // console.log(newUser);
    let moviesList = [];
    let actorsList = [];
    let style = "create";
    res.render("userForm.ejs", {
        style: style,
        user: newUser,
        movies: moviesList,
        actors: actorsList,
    });
});

// 

router.get("/users/update/:id", async function(req, res) {
    let curUser = await user.findById(req.params.id);
    //Need to collect favorite movies
    let moviesList = await Movies.find();
    // for (let i = 0; i < curUser.favMovies.length; i++) {
    //     var curMovie = await Movies.findById(curUser.favMovies[i]);
    //     moviesList.push(curMovie.title);
    // }
    //Need to collect favorite actors
    let actorsList = await Actors.find();
    // for (let i = 0; i < curUser.favActors.length; i++) {
    //     var curActor = await Actors.findById(curUser.favActors[i]);
    //     actorsList.push(curActor.name);
    // }
    let style = "update";



    res.render("userForm.ejs", {
        style: style,
        user: curUser,
        movies: moviesList,
        actors: actorsList,
    });
});

router.get("/users/addProfilePic/:id", async function(req, res) {
    let curUser = await user.findById(req.params.id);
    res.render("userPicForm.ejs", {
        user: curUser
    })
})

router.get("/users/:id", async function(req, res) {
    const curUser = await user.findById(req.params.id);
    console.log(curUser);
    //Need to collect favorite movies
    let moviesList = [];
    for (let i = 0; i < curUser.favMovies.length; i++) {
        var curMovie = await Movies.findById(curUser.favMovies[i]);
        moviesList.push(curMovie);
    }
    //Need to collect favorite actors
    let actorsList = [];
    for (let i = 0; i < curUser.favActors.length; i++) {
        var curActor = await Actors.findById(curUser.favActors[i]);
        console.log(curActor);
        actorsList.push(curActor);
    }

    //Need to collect profile pic if available
    // gfs.files.find().toArray((err, files) => {
    //     if (!files || files.length === 0) {
    //         console.log("No profile pic for this user");
    //     } else {
    //         files.map(file => {
    //             if (file.contentType === 'jpeg' || file.contentType === 'jpg' || file.contentType === 'png') {
    //                 file.isImage = true;
    //             } else {
    //                 file.isImage = false;
    //             }
    //         })
    //     }
    // });


    res.render("userSingle.ejs", {
        user: curUser,
        //profilePic: files,
        moviesList: moviesList,
        actorsList: actorsList,
    });
});

//Need to have a place to store files
router.get('users/images/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});


router.get("/users/delete/:id", async function(req, res) {
    await user.findByIdAndDelete(req.params.id).exec();
    res.redirect("/DataTypePages/UserData/users");

});

router.post("/users/update/:id", userController.update_post);

router.post("/users/addProfilePic/:id", upload.single('profilePic'), (req, res) => {
    res.redirect("/users");
})


router.get("*", async(req, res) => {
    //res.status = 404;
    let fileLoc = path.join(__dirname, "..", "public", "404.html");
    res.sendFile(fileLoc);
});

module.exports = router;








//router.get("/graphs", async function(req, res) {
//     //Need to collect master lists of all movies, actors and users
//     let moviesList = await Movies.find();
//     let actorsList = await Actors.find();
//     let userList = await user.find();

//     //Need to find counts and create labels for each movie and actor
//     let movieCounts = new Map();
//     let actorCounts = new Map();
//     let movieLabels = [];
//     let actorLabels = [];
//     for (let i = 0; i < userList.length; i++) {
//         for (let curMovie of userList[i].favMovies) {
//             //console.log(userList[i]);
//             let tester = await Movies.findById(curMovie._id);
//             if (!movieCounts.has(tester.title)) {
//                 movieCounts.set(tester.title, { count: 0 });
//                 movieLabels.push(tester.title);
//             }
//             let curCount = movieCounts.get(tester.title).count;
//             //console.log(movieCounts.get(tester.title));
//             curCount++;
//             movieCounts.set(tester.title, { count: curCount });
//         }
//     }

//     for (let i = 0; i < userList.length; i++) {
//         for (let curActor of userList[i].favActors) {
//             //console.log(userList[i]);
//             let tester = await Actors.findById(curActor._id);
//             if (!actorCounts.has(tester.name)) {
//                 actorCounts.set(tester.name, { count: 0 });
//                 actorLabels.push(tester.name);
//             }
//             let curCount = actorCounts.get(tester.name).count;
//             curCount++;
//             actorCounts.set(tester.name, { count: curCount });
//         }
//     }
//     let movieData = [];
//     let i = 0;
//     //console.log("length: " + moviesList.length);
//     for (curMovie of moviesList) {
//         //console.log(movieCounts.get(curMovie.title));
//         if (!movieCounts.has(curMovie.title)) {
//             movieData.push({ x: curMovie.title, y: 0 });
//         } else {
//             movieData.push({ x: movieLabels[i], y: movieCounts.get(curMovie.title).count })
//         }
//         i++;
//     };

//     for (test of movieData) {
//         console.log(test);
//     }


//     let labels = ['Funny Movie', 'Spirited Away'];
//     //Need to pass in all data to graph page, this function should do all heavy lifting. EJS page makes no 
//     //calculations, just displays data.
//     res.render("userGraphs.ejs", {
//         // movieLabels: movieLabels,
//         // actorLabels: actorLabels,
//         movielabels: labels,
//         movieData: movieData,
//     });
// })