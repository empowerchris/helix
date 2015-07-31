var passport = require('passport');
var ConcurStrategy = require('passport-concur').Strategy;

exports.setup = function (User, config) {
  passport.use(new ConcurStrategy({
      clientID: config.concur.clientID,
      clientSecret: config.concur.clientSecret,
      callbackURL: config.concur.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        'concur.id': profile.id
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
            facebook: profile._json
          });
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        } else {
          return done(err, user);
        }
      })
    }
  ));
};
