var express = require('express');
const User = require('../models/user');
const bodyParser = require('body-parser');
const passport = require('passport');
var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.post('/signup', function (req, res, next) {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err });
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    }
  );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });
});

router.get('/logout', (req, res, next) => {
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
