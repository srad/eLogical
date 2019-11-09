var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
// var mongoose = require('mongoose');

var readLeaderboardJSON = require("./services/leaderboardService.js").readLeaderboardJSON;;
var addLeaderboardEntry = require("./services/leaderboardService.js").addLeaderboardEntry;;

// mongoose.connect("mongodb://localhost:27017/vuenodedb").then(
//           () => {console.log('Database connection is successful') },
//           err => { console.log('Error when connecting to the database'+ err)}
// );

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());



var port = process.env.PORT || 4000;


app.listen(port, function () {
  console.log('Listening on port ' + port);
});

app.get('/leaderboard', function(req, res) {
  data = readLeaderboardJSON();
  res.send(data);
});

app.post('/leaderboard', function(req, res) {
  addLeaderboardEntry(req.body.name, req.body.points)
  data = readLeaderboardJSON();
  res.send(data);
})