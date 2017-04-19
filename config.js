const db = require('./lib/db.js'),
      // AWS = require('aws-sdk'),
      configs = {
        development: {
          awsUrl: 'https://s3.us-east-2.amazonaws.com/confused-development/comics/',
          mode: 'development',
          port: 5959
        },
        production: {
          awsUrl: 'https://s3.amazonaws.com/confused-production/comics/',
          mode: 'production',
          port: process.env.PORT || 5000
        }
      };

let config = configs[process.env.NODE_ENV || 'development'];
config.db = db;
// config.s3 = new AWS.S3();

module.exports = config;
