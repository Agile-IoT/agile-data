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
const { Subscription, Timer, Settings } = require('./models');
const debug = require('debug-levels')('agile-data');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

// db.log_events.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 3600 } )

module.exports = () => {
  mongoClient.connectAsync('mongodb://localhost:27017/agile-data')
    .then((db) => {
      db.collection('records').ensureIndex({ 'expireAt': 1 }, { expireAfterSeconds: 0 }, (err) => {
        if (err) Promise.reject(err);
      });
    })
    .then(() => {
      return Settings.find({});
    })
    .then(s => {
      if (s.length < 1) {
        Settings.create({});
      }
    })
    .then(s => {
      return Subscription.find({});
    })
    .then(subscriptions => {
      subscriptions.forEach(sub => {
        Timer.update(sub);
      });
    })
    .catch(err => {
      debug.log(err);
      console.log(err);
      throw Error('Bootstraping subscriptions failed');
    });
};
