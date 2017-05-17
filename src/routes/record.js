const express = require('express');
const router = express.Router();
const subscriptions = require('../models/subscription');
const _ = require('lodash');
const DB_NAME = 'agile_db';
const influx = require('../models/influxdb');
const squel = require("squel");
const influxUtil = require('influx')

function buildQuery(query) {

  let queryObj = squel.select().from('records');

  if (_.isEmpty(query.where)) {
    const whereStatements = JSON.parse(query.where);
    _.reduce(Object.keys(whereStatements), (key) => {
      return queryObj.where(`${key}=?`, whereStatements[key]);
    });
  }

  if (query.limit) {
    queryObj.limit(query.limit, limit.asc);
  }

  if (query.order) {
    const order = JSON.parse(query.order);
    queryObj.order(order.by, 'DESC');
  }

  return queryObj.toString();
}

router.route('/')
  .get((req, res, next) => {
    const query = buildQuery(req.query)
    influx.query(query)
    .then((data) => {
      res.send(data)
    })
    .catch(next)
  })
  .post((req, res, next) => {

  })
  .put((req, res, next) => {

  })
  .delete((req, res, next) => {

  })

module.exports = router
