/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const subscriptionRoutes = require('./routes/subscription');
const recordRoutes = require('./routes/record');
const settingsRoutes = require('./routes/settings');
const cloudsRoutes = require('./routes/clouds');

const config = require('./config');
const bootstrap = require('./bootstrap');

bootstrap();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  if (req.headers.authorization) {
    req.token = req.headers.authorization.split(' ')[1];
  }
  next();
});

app.get('/ping', function (req, res) {
  res.send('OK');
});

app.use('/api/subscription', subscriptionRoutes);
app.use('/api/record', recordRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/clouds', cloudsRoutes);

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

// Connect to Mongo on start
app.listen(config.PORT, function () {
  console.log(`Example app listening on port ${config.PORT}!`);
});
