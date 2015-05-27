var express = require('express');
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Player = require('../database/models/Player.js');

var secret = 'ThisIsAnotSecretKeyWhichShouldGetReplaced';

var loginUser = function(email, password, res) {
	Player.findOne({
		email: email
	}, function(err, player) {
		if (err || !player) {
			res.paramError(err, 'User not found!');
		} else {
			if (passwordHash.verify(password, player.password)) {
				var token = jwt.sign({
					email: player.email,
					displayName: player.displayName,
					avatarURL: player.avatarURL,
					_id: player._id,
					login: true
				}, secret);
				res.success({
					token: token
				});
			} else {
				res.paramError(err, 'Invalid password!');
			}
		}
	});
}

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

	app.post('/auth/login', jsonParser, function(req, res, next) {
		if (req.body != null && req.body.email != null && req.body.password != null) {
			loginUser(req.body.email, req.body.password, res);
		} else {
			res.paramError('invalid params');
		}
	});

	app.post('/auth/register', jsonParser, function(req, res, next) {
		if (req.body != null && req.body.email != null && req.body.displayName && req.body.password) {
			Player.findOne({
				email: req.body.email
			}, function(err, player) {
				if (err || !player) {
					var hashedPassword = passwordHash.generate(req.body.password);
					var newplayer = new Player({
						displayName: req.body.displayName,
						password: hashedPassword,
						email: req.body.email,
					});
					newplayer.save(function(err, newplayer) {
						if (err) return res.internalError(err);
						loginUser(req.body.email, req.body.password, res);
					});
				} else {
					res.paramError('Email already registered!', 'Email already registered!');
				}
			});
		} else {
			res.paramError('invalid params', 'no param');
		}
	});



	return app;
};
