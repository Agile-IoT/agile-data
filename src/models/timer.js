const _ = require('lodash');
const influx = require('./influxdb');
const config = require('../config');
const debug = require('debug-levels')('agile-data');
const TIMERS = {};

function generateTimerId (sub) {
  return `${sub.deviceID}-${sub.componentID}-${sub.user && sub.user.id}`;
}

function getTimer (sub) {
  return TIMERS[generateTimerId(sub)];
}

module.exports = {
  update: function updateTimer (sub) {
    TIMERS[generateTimerId(sub)] = setInterval(() => {
      const agile = require('agile-sdk')({
        api: config.AGILE_API,
        idm: config.AGILE_IDM
      });

      agile.device.lastUpdate(sub.deviceID, sub.componentID)
      .then((data) => {
        debug.log('Data from agile-api', data);
        const tags = [ 'deviceID', 'componentID', 'user' ];
        return influx.writePoints([
          {
            measurement: 'records',
            tags: _.pick(sub, tags),
            fields: _.omit(data, tags)
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

    return sub;
  },
  get: getTimer,
  clear: function clearTimer (sub) {
    clearInterval(getTimer(sub));
    return sub;
  }
};
