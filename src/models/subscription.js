'use strict';
const _ = require('lodash');
const uuid = require('uuid/v4');
const Promise = require('bluebird');
const config = require('../config');
const timers = require('./timer');
const db = require('./db');
const subscriptions = db.get('subscriptions');
const clients = db.get('clients');

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

    return Promise.resolve(sub)
    .then((sub) => {
      // Don't enforce authentication
      if (token) {
        const agile = require('agile-sdk')({
          api: 'http://localhost:9999',
          idm: 'http://localhost:3000',
          token: token,
        });

        return agile.idm.user.getCurrentUserInfo()
        .then((userInfo) => {
          const authedSub = Object.assign(sub, {
            user: userInfo
          });
          return authedSub;
        })
        .then((authedSub) => {
          return agile.idm.entity.create(`agile-data-${uuid()}`, 'client', {
            name : `${authedSub.deviceID}-${authedSub.componentID}`,
            clientSecret: uuid(),
            redirectURI: `${config.AGILE_IDM}/auth/${authedSub.deviceID}-${authedSub.componentID}/callback` }
          ).then((client) => {
            console.log('entity created!' + JSON.stringify(client, null, 2));
            const newSub = Object.assign(sub, {
              client: client.id
            });

            clients.push(client).write();
            return authedSub;
          })
        })
      } else {
        // unauthenticated subscription
        return sub;
      }
    })
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
