const express = require('express');
const router = express.Router();
const _ = require('lodash');
const config = require('../config');
const Record = require('../models/record');

router.route('/')
  .get((req, res, next) => {
    Record.find(req.query)
    .then(data => res.send(data))
    .catch(next);
  })
  .post((req, res, next) => {
    Record.create(req.body)
    .then(data => res.send(data))
    .catch(next);
  })
  .delete((req, res, next) => {
    Record.remove({})
    .then(() => res.sendStatus(200))
    .catch(next);
  });

router.route('/:id')
  .delete((req, res, next) => {
    Record.findByIdAndRemove(req.params.id)
    .then(() => res.send(200))
    .catch(next);
  });

router.route('/retention')
  .get((req, res, next) => {
    res.send()
  })
  .put((req, res, next) => {
    res.send()
  });

module.exports = router;
