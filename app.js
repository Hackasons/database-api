"use strict";

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let connect = require('connect');
let methodOverride = require('method-override');

let accounts = require('./endpoints/accounts');
let notes = require('./endpoints/notes');

let app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//TODO: use session Token for security;
// app.use(express.session({secret: "hshshshsh"}));
// app.use(express.csrf())
// app.use(function(req, res, next) {
//     res.locals.csrftoken = req.csrfToken();
//     next();
// });


//routing
app.use('/notes', notes);
app.use('/accounts', accounts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(res.locals);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
