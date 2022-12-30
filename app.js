var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// npm i mongoose --save
var mongoose = require('mongoose');

// 1. require하기
var boardRouter = require('./routes/board');
var memberRouter = require('./routes/member');
var bookRouter = require('./routes/book');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 주소 설정 전에 접속하기
// mongodb://아이디:암호@서버주소:포트번호/DB명
mongoose.connect("mongodb://id203:pw203@1.234.5.158:37017/db203")
mongoose.connection;

// 2. 주소 설정하기
app.use('/api/board', boardRouter);
app.use('/api/member', memberRouter);
app.use('/api/book', bookRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
