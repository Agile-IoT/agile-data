const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Subscription = require('../models/subscription');

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
  });

router.route('/:subscriptionId')
  .get((req, res, next) => {
    Subscription.findById(req.params.subscriptionId)
    .then((sub) => res.send(sub))
    .catch(next);
  })
  .put((req, res, next) => {
    Subscription.findById(req.params.subscriptionId)
    .then(sub => {
      _.assign(sub, req.body);
      return sub.save();
    })
    .then(sub => res.send(sub))
    .catch(next);
  })
  .delete((req, res, next) => {
    Subscription.findByIdAndRemove(req.params.subscriptionId)
    .then(() => res.send(200))
    .catch(next);
  });

module.exports = router;
