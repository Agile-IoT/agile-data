const express = require('express');
const router = express.Router();
const subscriptions = require('../models/subscription');
const _ = require('lodash');

router.route('/')
  .get((req, res, next) => {
    subscriptions.get()
    .then((data) => res.send(data))
    .catch(next)
  })

router.route('/:deviceID/:componentID')
  .get((req, res, next) => {
    subscriptions.get(req.params)
    .then((data) => res.send(data))
    .catch(next)
  })
  .post((req, res, next) => {
    const newSub = _.assign({
      interval: req.body.interval
    }, req.params)

    subscriptions.create(newSub)
    .then((data) => res.send(data))
    .catch((err) => {
      console.log(err);
      next(err)
    })
  })
  .put((req, res, next) => {
    const newSub = _.assign({
      interval: req.body.interval
    }, req.params)

    subscriptions.update(newSub)
    .then((data) => res.send(data))
    .catch(next)
  })
  .delete((req, res, next) => {
    subscriptions.delete(req.params)
    .then(() => res.send())
    .catch(next)
  })

module.exports = router
