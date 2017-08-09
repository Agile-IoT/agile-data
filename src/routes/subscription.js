const express = require('express');
const router = express.Router();
const subscriptions = require('../models/subscription');
const _ = require('lodash');

router.route('/')
  .get((req, res, next) => {
    subscriptions.get(req.params, req.token)
    .then((data) => res.send(data))
    .catch(next);
  })
  .post((req, res, next) => {
    subscriptions.create(req.body, req.token)
    .then((data) => res.send(data))
    .catch(next);
  });

router.route('/:deviceID')
  .get((req, res, next) => {
    subscriptions.get(req.params)
    .then((data) => res.send(data))
    .catch(next);
  });

router.route('/:deviceID/:componentID')
  .get((req, res, next) => {
    subscriptions.get(req.params, req.token)
    .then((data) => res.send(data))
    .catch(next);
  })
  .put((req, res, next) => {
    const newSub = _.assign({
      interval: req.body.interval
    }, req.params);

    subscriptions.update(newSub, req.token)
    .then((data) => res.send(data))
    .catch(next);
  })
  .delete((req, res, next) => {
    subscriptions.delete(req.params, req.token)
    .then(() => res.send())
    .catch(next);
  });

module.exports = router;
