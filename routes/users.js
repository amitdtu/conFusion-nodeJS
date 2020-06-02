var express = require('express');
const User = require('../models/user');
const bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.post('/signup', function (req, res, next) {
  User.findOne({ username: req.body.username }).then((user) => {
    if (user != null) {
      const err = new Error(`User ${req.body.username} already exists.`);
      err.status = 403;
      next(err);
    } else {
      User.create({
        username: req.body.username,
        password: req.body.password,
      })
        .then(
          (user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Registration successfull ', user });
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  });
});

router.post('/login', (req, res, next) => {
  console.log(req.session);
  if (!req.session || !req.session.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error(`You are not authenticated.`);
      res.setHeader('WWW-Authenticate', 'Basic');
      res.statusCode = 401;
      next(err);
      return;
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');

    const [username, password] = auth;
    User.findOne({ username: username })
      .then((user) => {
        if (user === null) {
          const err = new Error(`User ${user} doesn't exists.`);
          err.status = 403;
          next(err);
        } else if (user.password !== password) {
          const err = new Error(`Password is incorrect.`);
          err.status = 403;
          next(err);
        } else if (user.username === username && user.password === password) {
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are logged in.');
        }
      })
      .catch((err) => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated.');
  }
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
