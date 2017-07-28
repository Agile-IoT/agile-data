/*******************************************************************************
 *Copyright (C) 2017 Resin.io.
 *All rights reserved. This program and the accompanying materials
 *are made available under the terms of the Eclipse Public License v1.0
 *which accompanies this distribution, and is available at
 *http://www.eclipse.org/legal/epl-v10.html
 *
 *Contributors:
 *    Resin.io - initial API and implementation
 ******************************************************************************/
'use strict';
const Influx = require('influx');
const _ = require('lodash');
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

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(config.DB_NAME)) {
      return influx.createDatabase(config.DB_NAME);
    }
  })
  .then(() => {
    return influx.showRetentionPolicies();
  })
  .then((policies) => {
    if (!_.find(policies, { name: config.DB_RP_NAME })) {
      return influx.createRetentionPolicy(config.DB_RP_NAME, {
        database: config.DB_NAME,
        duration: config.DB_RP_DURATION,
        replication: 1,
        isDefault: true
      });
    }
  })
  .catch((err) => {
    throw new Error('Failed to bootstrap influx: ' + err);
  });

module.exports = influx;
