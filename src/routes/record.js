const express = require('express');
const router = express.Router();
const subscriptions = require('../models/subscription');
const _ = require('lodash');
const DB_NAME = 'agile_db';
const influx = require('../models/influxdb');
const squel = require("squel");
const influxUtil = require('influx')

function buildQuery(query) {

  let queryObj = squel.select().from('sensor');

  if (query.where) {
    const whereStatements = JSON.parse(query.where);
    _.reduce(Object.keys(whereStatements), (key) => {
      return queryObj.where(`${key}=?`, whereStatements[key]);
    });
  }

  if (query.limit) {
    queryObj.limit(query.limit);
  }

  if (query.order) {
    queryObj.order("time", true)
    // queryObj.order(query.order.by, query.order.ASC);
  }

  return queryObj.toString();
}

router.route('/')
  .get((req, res, next) => {
    const query = buildQuery(req.query)
    console.log(query)
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
