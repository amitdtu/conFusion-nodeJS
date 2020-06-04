// const createError = require('http-errors');
// const express = require('express');
// const path = require('path');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
// const mongoose = require('mongoose');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
// const passport = require('passport');
const authenticate = require('./authenticate');
// const bodyParser = require('body-parser');
// // const passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var User = require('./models/user');

// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
// const dishRouter = require('./routes/dishRouter');
// const promoRouter = require('./routes/promoRouter');
// const leaderRouter = require('./routes/leaderRouter');
// const Dishes = require('./models/dishes');

// const app = express();

// const url = 'mongodb://localhost:27017/conFusion';

// const connect = mongoose.connect(url);

// connect.then(
//   () => {
//     console.log('Connected to database successfully.');
//   },
//   (err) => {
//     console.log(err);
//   }
// );

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// // app.use(cookieParser('12345-567890-12345-78910'));

// app.use(
//   session({
//     name: 'session-id',
//     secret: '12345-567890-12345-78910',
//     saveUninitialized: false,
//     resave: false,
//     store: new FileStore(),
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser);
// passport.deserializeUser(User.deserializeUser);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// function auth(req, res, next) {
//   console.log(req.user);
//   if (!req.user) {
//     const err = new Error(`You are not authenticated.`);
//     err.status = 401;
//     next(err);
//   } else {
//     next();
//   }
// }

// // app.use(auth);

// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/dishes', dishRouter);
// app.use('/promotions', promoRouter);
// app.use('/leaders', leaderRouter);

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;

// new

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var config = require('./config');

var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// mongodb connect
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
connect.then(
  () => {
    console.log('Connected to database successfully.');
  },
  (err) => {
    console.log(err);
  }
);

app.use(
  session({
    name: 'session-id',
    secret: '12345-567890-12345-78910',
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

// passport config
var User = require('./models/user');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});

module.exports = app;
