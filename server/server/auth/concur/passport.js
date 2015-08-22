var passport = require('passport');
var ConcurStrategy = require('passport-concur').Strategy;

exports.setup = function (User, config) {
  passport.use(new ConcurStrategy({
      clientID: config.concur.clientID,
      clientSecret: config.concur.clientSecret,
      callbackURL: config.concur.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      var concur = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      };

      done(null, concur);
    }
  ));
};
