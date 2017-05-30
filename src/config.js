module.exports = {
  DB_NAME: 'agileDB',
  DB_RP_DURATION: '7d',
  DB_RP_NAME: 'defaultRP',
  PORT: '1338',
  DB_FILE: process.env.DB_FILE || `${__dirname}/data/db.json`
};
