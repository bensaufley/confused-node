import { parse } from 'node:url';
import pg from 'pg';

const isProd = process.env.NODE_ENV === 'production';

let config;

// for Heroku
if (isProd) {
  const params = parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');

  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true,
  };
} else {
  config = {
    user: 'root',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'confused_development',
    ssl: false,
  };
}

const pool = new pg.Pool(config);

export const query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

export const connect = pool.connect;
