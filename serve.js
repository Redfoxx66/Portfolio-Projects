const express = require("Express");
const app = express();

const port = 3000;

// app.get("/index.html", (req, res) => {
//     console.log(req);
//     res.sendFile(__dirname + "/public/index.html");
// });

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
})