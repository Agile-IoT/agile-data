'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const subscriptionRoutes = require('./routes/subscription');
const recordRoutes = require('./routes/record');
const config = require('./config');
const bootstrap = require('./bootstrap');
const db = require('./models/db');

bootstrap();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  if (req.headers.authorization) {
    req.token = req.headers.authorization.split(' ')[1];
  }
  next();
});

// Connect to Mongo on start
db.connect('mongodb://localhost:27017/mydatabase', function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    app.listen(3000, function() {
      console.log('Listening on port 3000...')
    })
  }
})

app.get('/ping', function (req, res) {
  res.send('OK');
});

app.use('/api/subscription', subscriptionRoutes);
app.use('/api/record', recordRoutes);

app.use(function (req, res) {
  res.status(404).send('Not Found');
});

app.use((err, req, res) => {
  switch (err.name) {
    case 'subscription already exists':
      return res.status(400).send(err);
    default:
      return res.status(500).send(err);
  }
});

app.listen(config.PORT, function () {
  console.log(`Example app listening on port ${config.PORT}!`);
});
