const express = require('express');
const bodyParser = require('body-parser');
const generateDoc = require("./script")

// Set up the express app
const app = express();

app.use(express.static("./generateproposal.html"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/generatedoc", generateDoc);
app.all('*', (req, res) => {
    res.status(200).sendFile(`${__dirname}/generateproposal.html`);
  });


const port = process.env.PORT || 4000;
app.set('port', port);
app.listen(port, () => console.log('server started'));
module.exports = app;