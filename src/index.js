'use strict';
const debug = require('debug-levels')('agile-data');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const bodyParser = require('body-parser');

const dbName = process.env.AGILE_DATA_DB_NAME || 'agile_db';
const dbMeasurement = process.env.AGILE_DATA_DB_MEASUREMENT || 'sensors';
const subscriptionRoutes = require('./routes/subscription');
const recordRoutes = require('./routes/record');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/ping', function (req, res) {
  res.send('OK')
})

app.use('/api/subscription', subscriptionRoutes)
app.use('/api/record', recordRoutes)

app.use((err, req, res) => {
  switch (err.name) {
    case 'subscription already exists':
      return res.status(400).send(err);
    default:
      return res.status(500).send(err);
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
