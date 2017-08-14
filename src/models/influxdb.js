'use strict';
const Influx = require('influx');
const config = require('../config');

const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: config.DB_NAME,
  schema: [
    {
      measurement: 'response_times',
      fields: {
        unit: Influx.FieldType.STRING,
        value: Influx.FieldType.FLOAT,
        format: Influx.FieldType.STRING,
        lastUpdate: Influx.FieldType.STRING
      },
      tags: [
        'deviceID', 'componentID'
      ]
    }
  ]
});

module.exports = influx;
