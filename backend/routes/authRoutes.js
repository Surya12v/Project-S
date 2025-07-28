const router = require('express').Router();
const passport = require('passport');
const { 
  login, 
  register, 
  forgotPassword, 
  resetPassword,
  registerAdmin 
} = require('../controllers/authController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Debug endpoint to check session
router.get('/check-session', (req, res) => {
  console.log('Session data:', req.session);
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user
  });
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

// Local auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/register-admin', isAdmin, registerAdmin);

// User session routes
router.get('/me', (req, res) => {
  res.json(req.user || null);
});

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect(process.env.FRONTEND_URL + '/');
  });
});

module.exports = router;