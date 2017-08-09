const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { Subscription, Timer } = require('../models');

router.route('/')
  .get((req, res, next) => {
    Subscription.find({})
    .then(subscriptions => res.send(subscriptions))
    .catch(next);
  })
  .post((req, res, next) => {
    Subscription.create(req.body)
    .then(newSub => res.send(newSub))
    .catch(next);
  })
  .delete((req, res, next) => {
    Subscription.remove({})
    .then(() => {
      Timer.clearAll();
    })
    .then(() => res.sendStatus(200))
    .catch(next);
  });

router.route('/:id')
  .get((req, res, next) => {
    Subscription.findById(req.params.id)
    .then((sub) => res.send(sub))
    .catch(next);
  })
  .put((req, res, next) => {
    Subscription.findById(req.params.id)
    .then(sub => {
      _.assign(sub, req.body);
      return sub.save();
    })
    .then(sub => res.send(sub))
    .catch(next);
  })
  .delete((req, res, next) => {
    Subscription
    .findById(req.params.id)
    .then(sub => sub.clearTimer())
    .then(sub => sub.remove())
    .then(() => res.sendStatus(200))
    .catch(next);
  });

module.exports = router;
