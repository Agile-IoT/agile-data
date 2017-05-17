'use strict';
const _ = require('lodash');
const db = require('lowdb')();
const DB_FILE = `${__dirname}/../data/db.json`
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const agile = require('agile-sdk')('http://localhost:8080');
const subscriptions = db.get('subscriptions');
const influx = require('./influxdb');
const debug = require('debug-levels')('agile-data');

function getIds(sub) {
  return _.pick(sub, ['deviceID', 'componentID']);
}

function subscriptionExists(sub) {
  return subscriptions.find(getIds(sub)).value()
}

function bootstrap() {
  agile.protocolManager.discovery.start()
  .then(function() {
    debug.log('started discovery!');
    return fs.readFileAsync(DB_FILE)
  })
  .then(data => {
    return db.set('subscriptions', JSON.parse(data).subscriptions || []).write()
  })
  .then(() => {
    return subscriptions.forEach(updateTimer).write();
  })
  .catch(err => {
    console.log(err)
    throw Error('Bootstraping subscriptions failed');
  })
}

function removeTimer(sub) {
  clearInterval(sub.timer);
  delete sub.timer;
  return sub;
}

function updateTimer(sub) {
  const newSub = removeTimer(sub)
  newSub.timer = setInterval(function () {
    agile.device.lastUpdate(sub.deviceID, sub.componentID)
    .then((temperatureReading) => {
      return influx.writePoints([
        {
          measurement: 'sensor',
          tags: getIds(sub),
          fields: _.omit(temperatureReading, ['deviceID', 'componentID'])
        }
      ])
    })
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });
  }, sub.interval)

  return newSub;
}

function clean(sub) {
  // we don't want to return the timer
  // so we remove it before passing to the api
  delete sub.timer;
  return sub;
}

bootstrap()

module.exports = {
  get: (filter) => {
    if (filter) {
      return Promise.resolve(
        subscriptions
          .find(filter)
          .cloneDeep()
          .tap(clean)
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

    const record = subscriptions.find(getIds(sub))

    record
      .assign(sub)
      .tap(updateTimer)
      .write()

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
      .write()

    // remove sub from db
    subscriptions
      .remove(getIds(sub))
      .write()

    return Promise.resolve();
  }
}

function exitHandler(options, err) {
  subscriptions.forEach(removeTimer).write();
  fs.writeFileSync(DB_FILE, JSON.stringify(db.getState(), null, 4))
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

// catches normal exit
process.on('exit', exitHandler.bind(null, { cleanup:true } ));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit:true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit:true }));
