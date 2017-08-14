const isProd = () => {
  return process.env.NODE_ENV === 'production';
};

module.exports = {
  PORT: '1338',
  AGILE_API: isProd() ? 'http://agile-core:8080' : 'http://localhost:9999',
  AGILE_IDM: isProd() ? 'http://agile-security:3000' : 'http://localhost:3000',
  AGILE_DATA: isProd() ? 'http://agile-data:1338' : 'http://localhost:1338'
};
