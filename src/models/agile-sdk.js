const config = require('../config');

const agile = require('agile-sdk')({
  api: config.AGILE_API,
  idm: config.AGILE_IDM
});

module.exports = agile;
