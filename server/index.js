require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use('/auth-token', require('./auth_token'));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(9000, () => console.log("Listening on port 9000!"));
