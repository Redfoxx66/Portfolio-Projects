var express = require('express');
var router = express.Router();
var path = require('path');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('../DataTypePages/Movies.html', function(req, res, next) {
    res.send("Movies.html");
})

router.get('../DataTypePages/UserData.html', function(req, res) {
    res.sendFile("UserData.html");
})

router.get('../DataTypePages/Actors.html', function(req, res) {
    res.send("Actors.html");
})

router.get("*", async(req, res) => {
    //res.status = 404;
    let fileLoc = path.join(__dirname, '..', 'public', '404.html')
    res.sendFile(fileLoc);
})

module.exports = router;