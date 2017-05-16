'use strict'
const Influx = require('influx');
const debug = require('debug-levels')('agile-data');

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const _ = require('lodash')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const dbName = process.env.AGILE_DATA_DB_NAME || 'agile_db';
const dbMeasurement = process.env.AGILE_DATA_DB_MEASUREMENT || 'sensors';

const subscriptions = require('./subscriptions');

app.get('/ping', function (req, res) {
  res.send('OK')
})

app.route('/api/subscription')
  .get((req, res, next) => {
    subscriptions.get()
    .then((data) => res.send(data))
    .catch(next)
  })

app.route('/api/subscription/:deviceID/:componentID')
  .get((req, res, next) => {
    subscriptions.get(req.params)
    .then((data) => res.send(data))
    .catch(next)
  })
  .post((req, res, next) => {
    const newSub = _.assign({
      interval: req.body.interval
    }, req.params)

    subscriptions.create(newSub)
    .then((data) => res.send(data))
    .catch(next)
  })
  .put((req, res, next) => {
    const newSub = _.assign({
      interval: req.body.interval
    }, req.params)

    subscriptions.update(newSub)
    .then((data) => res.send(data))
    .catch(next)
  })
  .delete((req, res, next) => {
    subscriptions.delete(req.params)
    .then(() => res.send())
    .catch(next)
  })

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

app.use(function(err, req, res) {
  switch (err.name) {
    case 'subscription already exists':
      return res.status(400).send(err);
    default:
      return res.status(500).send(err);
  }
});
