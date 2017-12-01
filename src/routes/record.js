const express = require('express');
const router = express.Router();
const MongoQS = require('mongo-querystring');
const qs = new MongoQS();

const { Record } = require('../models');

router.route('/')
  .get((req, res, next) => {
    if (req.query) {
      Record.find(req.query)
        .then(data => res.send(data))
        .catch(next);
    } else {
      Record.find({})
        .then(data => res.send(data))
        .catch(next);
    }
  })
  .post((req, res, next) => {
    Record.create(req.body)
      .then(data => res.send(data))
      .catch(next);
  })
  .delete((req, res, next) => {
    Record
      .remove({})
      .then(() => res.sendStatus(200))
      .catch(next);
  });

router.route('/:id')
  .delete((req, res, next) => {
    Record.findByIdAndRemove(req.params.id)
      .then(() => res.sendStatus(200))
      .catch(next);
  });

module.exports = router;
