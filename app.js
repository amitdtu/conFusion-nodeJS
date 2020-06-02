const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const Dishes = require('./models/dishes');

const app = express();

const url = 'mongodb://localhost:27017/';

const connect = mongoose.connect(url);

connect.then(
  () => {
    console.log('Connected to database successfully.');
  },
  (err) => {
    console.log(err);
  }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-567890-12345-78910'));

function auth(req, res, next) {
  console.log(req.headers);
  if (!req.signedCookies.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error(`You are not authenticated.`);
      res.setHeader('WWW-Authenticate', 'Basic');
      res.statusCode = 401;
      next(err);
      return;
    }

    const auth = new Buffer(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');

    const [user, password] = auth;
    if (user === 'admin' && password === 'password') {
      res.cookie('user', 'admin', { signed: true });
      next();
    } else {
      const err = new Error(`You are not authenticated.`);
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
    }
  } else {
    if (req.signedCookies.user === 'admin') {
      next();
    } else {
      const err = new Error(`You are not authenticated.`);
      err.status = 401;
      next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
