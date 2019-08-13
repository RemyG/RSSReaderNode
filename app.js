var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');

var usersRouter = require('./api/users/route');
var feedsRouter = require('./api/feeds/route');
var entriesRouter = require('./api/entries/route');
var categoriesRouter = require('./api/categories/route');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/feeds', feedsRouter);
app.use('/api/v1/entries', entriesRouter);
app.use('/api/v1/categories', categoriesRouter);

module.exports = app;
