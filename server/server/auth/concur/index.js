'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var config = require('../../config/environment');
var router = express.Router();
var User = require('../../api/user/user.model');

var concur = require('concur-platform');

router
  /*.get('/', passport.authenticate('concur', {
   failureRedirect: '/signup',
   successRedirect: '/',
   session: false
   }))

   .get('/callback', passport.authenticate('concur', {
   failureRedirect: '/signup',
   successRedirect: '/',
   session: false
   }), auth.setTokenCookie)*/

  .get('/:userId', function (req, res, next) {
    passport.authenticate('concur', {
      callbackURL: config.concur.callbackURL + '/' + req.params.userId,
      session: false
    })(req, res, next);
  })

  .get('/callback/:userId', passport.authorize('concur', {
    failureRedirect: '/fail',
    session: false,
    passReqToCallback: true
  }), function (req, res, next) {
    var userId = req.params.userId;

    User.findById(userId, function (err, user) {
      if (err) return res.redirect('/fail');
      if (!user) return res.redirect('/fail');

      user.concur = req.account;

      concur.user.get({
        oauthToken: req.account.accessToken
      }).then(function (data) {
        user.concur.profile = data;
        user.save(function (err) {
          if (err) return next(err);
          res.redirect('/success');
        });
      }).fail(function (error) {
        console.log(error);
        res.redirect('/fail');
      });
    });
  });

module.exports = router;
