var express = require('express');
var jwt = require('jsonwebtoken');

//var secret = 'ThisIsAnotSecretKeyWhichShouldGetReplaced';
var secret = require('./secret.js');

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		if (req.headers != null && req.headers['api-auth-token'] != null && typeof req.headers['api-auth-token'] === 'string' && req.headers['api-auth-token'].length > 0) {
			jwt.verify(req.headers['api-auth-token'], secret, function(err, decoded) {
				if (err == null) {
					req.auth = decoded;
				}
				next();
			});
		} else {
			next();
		}
	});

	return app;
};