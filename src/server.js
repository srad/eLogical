const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;
const path = require("path");

app.use(cors());
app.use(express.static(path.join(__dirname, "..", "dist")));
app.get("/*", function(req, res) {
  res.sendFile(path.join(`${__dirname}/dist/index.html`));
});

app.listen(port, function () {
  console.log(`Example app listening on port:${port}`);
});