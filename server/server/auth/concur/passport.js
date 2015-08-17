var passport = require('passport');
var ConcurStrategy = require('passport-concur').Strategy;
var concur = require('concur-platform');

exports.setup = function (User, config) {
  passport.use(new ConcurStrategy({
      clientID: config.concur.clientID,
      clientSecret: config.concur.clientSecret,
      callbackURL: config.concur.callbackURL
    },
    function(accessToken, refreshToken, instanceUrl, expirationDate, done) {
      console.log(accessToken, refreshToken, instanceUrl, expirationDate);

      var options = {
        oauthToken: accessToken,
        loginId:'luckybeitia@gmail.com'
      };

      concur.user.get(options)
        .then(function(user) {
          console.log(user);
        })
        .fail(function(error) {
          console.log(error);
        });

      User.findOne({
        'concur.accessToken': accessToken
      },
      function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.username,
            provider: 'concur',
            concur: profile._json
          });
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    }
  ));
};
