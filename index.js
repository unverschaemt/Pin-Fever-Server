var express = require('express');
var mongoose = require('mongoose');

var auth = require('./auth/index.js');
var authMiddleware = require('./auth/middleware.js');

var respondTypes = require('./utils/respondTypes.js');
var Players = require('./apis/Players.js');
var TurnBasedMatches = require('./apis/TurnBasedMatches.js');

var Questions = require('./apis/Questions.js');
var Admin = require('./apis/Admin.js');

var app = express();

// Loading Database:
var db = mongoose.connect('mongodb://localhost/pinfever');

var port = 8080;

app.listen(port, function() {
	console.log("STARTED pinfever SERVER! PORT: ", port);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(respondTypes());

app.use(authMiddleware());

app.use('/auth', auth());

app.use('/players', Players());

app.use('/turnbasedmatch', TurnBasedMatches());

app.use('/question', Questions());

app.use('/admin', Admin());

app.use(function(req, res, next) {
	res.notFoundError({
		auth: req.auth
	});
})