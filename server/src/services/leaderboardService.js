const fs = require("fs");

const pathLeaderboardJSON = __dirname + "/../../store/leaderboard.json";

function readLeaderboardJSON() {
  var data = fs.readFileSync(pathLeaderboardJSON, "utf8");
  var obj = JSON.parse(data);
  return obj;
}

module.exports.readLeaderboardJSON = readLeaderboardJSON;

function addLeaderboardEntry(namePar, pointsPar) {
  var obj = readLeaderboardJSON();
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    obj = { table: [] };
    obj.table.push({ id: 0, name: namePar, points: pointsPar || 0 });
  }
  else {
    var ids = obj.table.map(e => e.id);
    var nextId = Math.max(...ids)+1;
    obj.table.push({id: nextId, name:namePar, points: pointsPar || 0});
  }
  var json = JSON.stringify(obj);
  fs.writeFileSync(pathLeaderboardJSON, json, "utf8");
}

module.exports.addLeaderboardEntry = addLeaderboardEntry;
