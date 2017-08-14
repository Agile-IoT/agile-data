const express = require('express');
const router = express.Router();
const { Settings } = require('../models');

router.route('/')
  .get((req, res, next) => {
    Settings.findOne({})
    .then(s => {
      if (s.length < 1) {
        Settings.create({});
      }
      return s
    })
    .then(s => res.send(s))
    .catch(next);
  })
  .put((req, res, next) => {
    Settings.findOne({})
    .then(s => s.update(req.body))
    .then(_ => Settings.findOne({}))
    .then(s => res.send(s))
    .catch(next);
  });

module.exports = router;
