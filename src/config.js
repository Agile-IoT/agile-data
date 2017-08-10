const isProd = () => {
  return process.env.NODE_ENV === 'production';
};

module.exports = {
  DB_NAME: 'agileDB',
  DB_RP_DURATION: '7d',
  DB_RP_NAME: 'defaultRP',
  PORT: '1338',
  DB_FILE: process.env.DB_FILE || `${__dirname}/data/db.json`,
  INTERVAL_DEFAULT: 100000,
  AGILE_API: isProd() ? 'http://agile-core:8080' : 'http://localhost:3000',
  AGILE_IDM: isProd() ? 'http://agile-security:3000' : 'http://localhost:3000',
  AGILE_DATA: isProd() ? 'http://agile-data:1338' : 'http://localhost:1338'
};
