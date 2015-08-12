'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || 'localhost',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'eL{wqNzT4QZDs]WJk,f3jKm8o'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  },

  concur: {
    clientID:     process.env.CONCUR_ID || 'gQA72oS3Zz3fmW8WI2BXTq',
    clientSecret: process.env.CONCUR_SECRET || 'uMFxYuFqWH3qRkqrvRfIR9ajrFGWQQ7A',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/concur/callback'
  },

  stripe: {
    apiKey: process.env.STRIPE_KEY || 'sk_test_tiZQODegz7kY5Iea2hxgC4J3',
    stripePubKey: process.env.STRIPE_PUB_KEY || 'pk_test_tBLnCyjvGT1AcTBr7seToAAi'
  },

  easypost: {
    apiKey: process.env.EASYPOST_KEY || '6pvCWggCww2HmdtIi43HUA'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
