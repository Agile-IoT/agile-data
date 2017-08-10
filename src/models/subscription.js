'use strict';
const _ = require('lodash');
const fileSync = require('lowdb/lib/storages/file-sync');
const Promise = require('bluebird');
const timers = require('./timer');
const config = require('../config');
const db = require('lowdb')(config.DB_FILE, {
  storage: {
    write: fileSync.write
  }
});
const subscriptions = db.get('subscriptions');

function getIds (sub) {
  return _.pick(sub, ['deviceID', 'componentID']);
}

function subscriptionExists (sub) {
  return subscriptions.find(getIds(sub)).value();
}

module.exports = {
  get: (filter, token) => {
    if (!filter) {
      return Promise.resolve(
        subscriptions
          .value()
      );
    }

    if (Object.keys(filter).length < 2) {
      return Promise.resolve(
        subscriptions.filter(filter).value()
      );
    }

    return Promise.resolve(
      subscriptions.find(filter).value()
    );
  },
  create: (sub, token) => {
    if (subscriptionExists(sub)) {
      return Promise.reject(new Error('subscription already exists'));
    }

    // const agile = require('agile-sdk')({
    //   api: 'http://localhost:9999',
    //   idm: 'http://localhost:3000',
    //   token: token,
    // });

    // return agile.idm.user.getCurrentUserInfo().then((userInfo) => {
    //   const newSub = Object.assign(sub, {
    //     user: userInfo
    //   });
    //   return newSub;
    // })
    return Promise.resolve(sub)
    .then((newSub) => {
      return subscriptions
        .push(_.assign(newSub, { created_at: Date.now() }))
        .find(getIds(newSub))
        .tap(timers.update)
        .write();
    })
    .then((newSub) => {
      return subscriptions
        .find(getIds(newSub))
        .value();
    });
  },
  update: (sub) => {
    if (!subscriptionExists(sub)) {
      return Promise.reject(new Error('subscription does not exist'));
    }

    if (!sub.interval) {
      return Promise.reject(new Error('subscription must have .interval'));
    }

    return Promise.resolve(
      subscriptions.find(getIds(sub))
        .assign(sub)
        .tap(timers.update)
        .write()
    );
  },
  delete: (sub) => {
    if (!subscriptionExists(sub)) {
      return Promise.reject(new Error('subscription does not exist'));
    }

    // clear timer
    subscriptions
      .find(getIds(sub))
      .tap(timers.clear)
      .write();

    // remove sub from db
    subscriptions
      .remove(getIds(sub))
      .write();

    return Promise.resolve();
  },
  db: db
};
