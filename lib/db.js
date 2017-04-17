const pg = require('pg'),
      url = require('url'),
      isProd = process.env.NODE_ENV === 'production';

let config;

// for Heroku
if (isProd) {
  const params = url.parse(process.env.DATABASE_URL),
        auth = params.auth.split(':');

  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
  };
} else {
  config = {
    user: 'root',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'confused_development',
    ssl: false
  };
}

const pool = new pg.Pool(config);

module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

module.exports.connect = pool.connect;
