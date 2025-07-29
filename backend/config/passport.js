const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

passport.serializeUser((user, done) => {
  logger.debug('Serializing user:', user); // <--- You should see this log after login/OAuth
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    logger.debug('Deserialized user:', user); // <--- You should see this log on each authenticated request
    done(null, user);
  } catch (err) {
    logger.error('Deserialize error:', err);
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.debug('Google profile received:', profile);
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          logger.info('Creating new user from Google profile');
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            role: 'user' // Set default role for Google OAuth users
          });
        }
        
        logger.auth('User authenticated:', user);
        return done(null, user);
      } catch (err) {
        logger.error('Google strategy error:', err);
        return done(err, null);
      }
    }
  )
);
