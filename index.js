var express = require('express');
var mongoose = require('mongoose');

var auth = require('./auth/index.js');
var authMiddleware = require('./auth/middleware.js');

var respondTypes = require('./utils/respondTypes.js');
var Players = require('./apis/Players.js');
var TurnBasedMatches = require('./apis/TurnBasedMatches.js');

var app = express();

// Loading Database:
var db = mongoose.connect('mongodb://localhost/pinfever');

var port = 8080;

app.listen(port, function() {
	console.log("STARTED pinfever SERVER! PORT: ", port);
});

app.use(respondTypes());

app.use(authMiddleware());

app.use('/auth', auth());

app.use('/players', Players());

app.use('/turnbasedmatches', TurnBasedMatches());

app.use(function(req, res, next) {
	res.notFoundError({
		auth: req.auth
	});
})