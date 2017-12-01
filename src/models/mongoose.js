const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.connect('mongodb://localhost/agile-data', {
  useMongoClient: true,
  promiseLibrary: Promise
});

module.exports = mongoose;
