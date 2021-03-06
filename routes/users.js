var express = require('express');
const User = require('../models/user');
const bodyParser = require('body-parser');
const passport = require('passport');
var router = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json());

router.get(
  '/',
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find()
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(users);
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  }
);

/* GET users listing. */
router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            console.log('authenticated successfully after signup');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    }
  );
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
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

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
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

router.get('/facebook/token', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('facebook-token')(req, res, () => {
    if (req.user) {
      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        token: token,
        status: 'You are successfully logged in!',
      });
    }
  });
});

module.exports = router;
