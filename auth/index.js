var express = require('express');
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Player = require('../database/models/Player.js');

//var secret = 'ThisIsAnotSecretKeyWhichShouldGetReplaced';
var secret = require('./secret.js');

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

	app.post('/login', jsonParser, function(req, res, next) {
		if (req.body != null && req.body.email != null && req.body.password != null) {
			loginUser(req.body.email, req.body.password, res);
		} else {
			res.paramError('invalid params');
		}
	});

	app.post('/register', jsonParser, function(req, res, next) {
		if (req.body != null && req.body.email != null && req.body.displayName && req.body.password) {
			Player.findOne({
				email: req.body.email
			}, function(err, player) {
				if (err) {
					return res.internalError('Database error!');
				}
				if (!player) {
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