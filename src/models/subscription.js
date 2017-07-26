#-------------------------------------------------------------------------------
# Copyright (C) 2017 Resin.io.
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
# 
# Contributors:
#     Resin.io - initial API and implementation
#-------------------------------------------------------------------------------
'use strict';
const _ = require('lodash');
const db = require('lowdb')();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const agile = require('agile-sdk')('http://localhost:8080');
const subscriptions = db.get('subscriptions');
const influx = require('./influxdb');
const debug = require('debug-levels')('agile-data');
const config = require('../config');

function getIds (sub) {
  return _.pick(sub, ['deviceID', 'componentID']);
}

function subscriptionExists (sub) {
  return subscriptions.find(getIds(sub)).value();
}

function bootstrap () {
  agile.protocolManager.discovery.start();
  fs.statAsync(config.DB_FILE)
  .catch(() => {
    return fs.writeFileAsync(config.DB_FILE, JSON.stringify({ subscriptions: [] }, null, 4));
  })
  .then(function () {
    debug.log('Started discovery!');
    return fs.readFileAsync(config.DB_FILE);
  })
  .then(data => {
    return db.set('subscriptions', JSON.parse(data).subscriptions || []).write();
  })
  .then(() => {
    return subscriptions.forEach(updateTimer).write();
  })
  .catch(err => {
    console.log(err);
    debug.log(err);
    throw Error('Bootstraping subscriptions failed');
  });
}

function removeTimer (sub) {
  clearInterval(sub.timer);
  delete sub.timer;
  return sub;
}

function updateTimer (sub) {
  const newSub = removeTimer(sub);
  newSub.timer = setInterval(function () {
    agile.device.lastUpdate(sub.deviceID, sub.componentID)
    .then((data) => {
      debug.log('Data from agile-api', data);
      return influx.writePoints([
        {
          measurement: 'records',
          tags: getIds(sub),
          fields: _.omit(data, ['deviceID', 'componentID'])
        }
      ]);
    })
    .then(() => {
      console.log('saved to db');
    })
    .catch(err => {
      console.log(err);
    });
  }, sub.interval);

  return newSub;
}

function clean (sub) {
  // we don't want to return the timer
  // so we remove it before passing to the api
  delete sub.timer;
  return sub;
}

bootstrap();

module.exports = {
  get: (filter) => {
    if (filter.componentID) {
      return Promise.resolve(
        subscriptions
          .find(filter)
          .cloneDeep()
          .tap(clean)
          .value()
      );
    } else if (filter) {
      return Promise.resolve(
        subscriptions
          .filter(filter)
          .cloneDeep()
          .map(clean)
          .value()
      );
    } else {
      return Promise.resolve(
        subscriptions
          .cloneDeep()
          .map(clean)
          .value()
      );
    }
  },
  create: (sub) => {
    if (subscriptionExists(sub)) {
      return Promise.reject(new Error('subscription already exists'));
    }

    subscriptions
      .push(_.assign(sub, { created_at: Date.now() }))
      .find(getIds(sub))
      .tap(updateTimer)
      .write();

    return Promise.resolve(
      subscriptions
        .find(getIds(sub))
        .cloneDeep()
        .tap(clean)
        .value()
    );
  },
  update: (sub) => {
    if (!subscriptionExists(sub)) {
      return Promise.reject(new Error('subscription does not exist'));
    }

    if (!sub.interval) {
      return Promise.reject(new Error('subscription must have .interval'));
    }

    const record = subscriptions.find(getIds(sub));

    record
      .assign(sub)
      .tap(updateTimer)
      .write();

    return Promise.resolve(
      record
        .cloneDeep()
        .tap(clean)
        .value()
    );
  },
  delete: (sub) => {
    if (!subscriptionExists(sub)) {
      return Promise.reject(new Error('subscription does not exist'));
    }

    // clear timer
    subscriptions
      .find(getIds(sub))
      .tap(removeTimer)
      .write();

    // remove sub from db
    subscriptions
      .remove(getIds(sub))
      .write();

    return Promise.resolve();
  }
};

function exitHandler (options, err) {
  subscriptions.forEach(removeTimer).write();
  fs.writeFileSync(config.DB_FILE, JSON.stringify(db.getState(), null, 4));
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

// catches normal exit
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
