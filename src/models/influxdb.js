'use strict';
const Influx = require('influx');
const DB_NAME = 'agileDB';

const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: DB_NAME,
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

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(DB_NAME)) {
      return influx.createDatabase(DB_NAME);
    }
  });

module.exports = influx;
