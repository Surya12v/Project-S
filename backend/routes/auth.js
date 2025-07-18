const router = require('express').Router();
const passport = require('passport');
const logger = require('../utils/logger');
const { 
  login, 
  register, 
  forgotPassword, 
  resetPassword,
  registerAdmin 
} = require('../controllers/authController');
const { isAdmin } = require('../middlewares/authMiddleware'); // Fix: middlewares not middleware

// Debug endpoint to check session
router.get('/check-session', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user
  });
});

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    logger.auth('Initiating Google OAuth flow');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Google callback session:', req.session); // <--- Check this output
    console.log('Google callback user:', req.user);       // <--- And this output
    logger.auth('Google callback successful. User:', req.user);
    // Store user data in session
    req.session.user = req.user;
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

router.get('/me', (req, res) => {
  logger.debug('Session data:', req.session);
  logger.debug('User data:', req.user);
  res.json(req.user || null);
});

// Logout route
router.get('/logout', (req, res) => {
  const userEmail = req.user?.email;
  req.logout(function(err) {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    logger.auth('User logged out:', userEmail);
    // Redirect to frontend AuthPages ("/")
    res.redirect(process.env.FRONTEND_URL + '/');
  });
});

// Local auth routes
router.post('/register', register);
router.post('/login', async (req, res, next) => {
  // Debug log
  console.log('Login attempt:', req.body);
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      // Debug log
      console.log('User logged in:', user);
      return res.json({ user });
    });
  })(req, res, next);
});

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Admin registration route - protected by isAdmin middleware
router.post('/register-admin', isAdmin, registerAdmin);

module.exports = router;
