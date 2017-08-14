const _ = require('lodash');
const influx = require('./influxdb');
const config = require('../config');
const debug = require('debug-levels')('agile-data');
const TIMERS = {};

module.exports = {
  update: function updateTimer (sub) {
    console.log(sub)
    console.log('hii')
    return TIMERS[sub.id] = setInterval(() => {
      console.log('running timer jobs', sub.id);
      const agile = require('agile-sdk')({
        api: config.AGILE_API,
        idm: config.AGILE_IDM
      });

      const client = null;

      return Promise.resolve(client)
      .then(client => {
        if (client) {
          return;
          return agile.idm.authentication.authenticateClient(client.name, client.clientSecret).then(function (result) {
            return result.access_token;
          })
        } else {
          return;
        }
      })
      .then(token => {
        // TODO allow the sdk to load a token after the fact.
        return require('agile-sdk')({
          api: config.AGILE_API,
          idm: config.AGILE_IDM,
          token: token
        });
      })
      .then(sdk => {
        return sdk.device.lastUpdate(sub.deviceID, sub.componentID)
      })
      .then(data => {
        debug.log('Data from agile-api', data);
        const tags = [ 'deviceID', 'componentID' ];
        return influx.writePoints([
          {
            measurement: 'records',
            tags: _.assign(_.pick(sub, tags), { userID: sub.userID }),
            fields: _.omit(data, tags.concat('user'))
          }
        ]);
      })
      .then(() => {
        console.log('saved to db');
      })
      .catch(err => {
        console.log(err);
      });
    }, sub.interval || config.INTERVAL_DEFAULT);
  },
  clear: function clearTimer (sub) {
    return clearInterval(timers[sub.id])
  }
};
