// @ts-check
import * as db from './lib/db.js';
// import AWS from 'aws-sdk';

const configs = {
  development: {
    awsUrl: 'https://s3.us-east-2.amazonaws.com/confused-development/comics/',
    mode: 'development',
    port: 5959,
  },
  production: {
    awsUrl: 'https://s3.amazonaws.com/confused-production/comics/',
    mode: 'production',
    port: process.env.PORT || 5000,
  },
};

const config = configs[process.env.NODE_ENV || 'development'];
config.db = db;
// config.s3 = new AWS.S3();

export default config;
