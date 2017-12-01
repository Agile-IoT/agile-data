const debug = require('debug-levels')('agile-data');
const Record = require('./record');
const Client = require('./client');
const agile = require('./agile-sdk');
const get = require('lodash/get');
const crypto = require('crypto');

const TIMERS = {};

module.exports = {
  update: function updateTimer (sub) {
    this.clear(sub);
    TIMERS[sub.id] = setInterval(() => {
      debug.log('running timer job', sub.id);
      // 1. Get subscription client
      // 2. Authenticate client and get token
      // 3. Fetch data from agile API
      // 4. Save new Record
      Client.findOne({ subscription: sub.id })
        .then(client => {
          if (client) {
            return agile.idm.authentication.authenticateClient(client.name, client.clientSecret).then(function (result) {
              return result.access_token;
            });
          }
        })
        .then(token => {
          agile.tokenSet(token);
          return agile.device.lastUpdate(sub.deviceID, sub.componentID);
        })
        .then(data => {
        // clear it for safety so no other requests use token
          agile.tokenDelete();
          debug.log('Data from agile-api', data);
          data.subscription = sub.id;

          // lets encrypt if there is an encryption key on the subscription
          const encryptionKey = get(sub, 'encrypt.key');
          const encryptionFields = get(sub, 'encrypt.fields');

          if (encryptionKey && encryptionFields) {
            // convert public key - base64 string to utf-8
            const key = Buffer.from(encryptionKey, 'base64').toString('utf-8');
            encryptionFields.map(k => {
              // encrypt each encryptionField with pub key + base64 encode.
              data[k] = crypto.publicEncrypt(key, Buffer.from(String(data[k]))).toString('base64');
            });
          }
          return Record.create(data);
        })
        .then(() => {
          debug('saved to db', Date.now());
        })
        .catch(err => {
          debug(err);
        });
    }, sub.interval);

    return TIMERS[sub.id];
  },
  clear: function clearTimer (sub) {
    return clearInterval(TIMERS[sub.id]);
  },
  clearAll: function () {
    return Object.keys(TIMERS).map(k => {
      return clearInterval(TIMERS[k]);
    });
  }
};
