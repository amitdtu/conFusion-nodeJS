var express = require('express');
const User = require('../models/user');
const bodyParser = require('body-parser');
const passport = require('passport');
var router = express.Router();
const authenticate = require('../authenticate');

router.use(bodyParser.json());

/* GET users listing. */
router.post('/signup', (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        console.log('registartion success');
        console.log(req.body);
        passport.authenticate('local')(req, res, () => {
          console.log('authenticated successfully after signup');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    }
  );
});

// router.post('/login', (req, res, next) => {
// passport.authenticate('local')(req, res, () => {
//   console.log('authenticated successfully after signup');
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'application/json');
//   res.json({ success: true, status: 'You are successfully logged in!' });
// });
// });

router.post('/login', (req, res, next) => {
  passport.authenticate('local')(req, res, () => {
    console.log('authenticated successfully after signup');
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token: token,
      status: 'You are successfully logged in!',
    });
  });
});

router.get('/logout', (req, res, next) => {
  // console.log(req.user);
  // console.log(req.session);
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error(`You are not logged in`);
    err.status = 403;
    next(err);
  }
});

module.exports = router;
