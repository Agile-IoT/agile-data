const config = require('../config');
const fileSync = require('lowdb/lib/storages/file-sync');
const db = require('lowdb')(config.DB_FILE, {
  storage: {
    write: fileSync.write
  }
});

module.exports = db;
