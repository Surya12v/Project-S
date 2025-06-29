const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
require('dotenv').config();
require('./config/passport');

const app = express();

// Middleware: CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser (must come before csurf)
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // true in production with HTTPS
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Apply CSRF Protection (after session + cookieParser)
app.use(csurf({ cookie: true }));

// ✅ Provide CSRF token to frontend
app.get('/api/csrf-token', (req, res) => {
  console.log('CSRF token requested', req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

// ❌ Exclude CSRF on Razorpay webhook
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Don't apply csrf middleware here
  res.status(200).send('Webhook received');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON format' });
  }

  res.status(500).json({ success: false, error: err.message || 'Something went wrong' });
});

module.exports = app;
