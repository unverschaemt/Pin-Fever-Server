var express = require('express');
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var Player = require('../database/models/Player.js');

var secret = 'ThisIsAnotSecretKeyWhichShouldGetReplaced';

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		if (req.query != null && req.query.token != null && typeof req.query.token === 'string' && req.query.token.length > 0) {
			jwt.verify(req.query.token, secret, function(err, decoded) {
				if (err == null) {
					req.auth = decoded;
				}
				next();
			});
		} else {
			next();
		}
	});

	app.get('/auth/login', function(req, res, next) {
		if (req.query != null && req.query.email != null && req.query.password != null) {

			Player.findOne({
				email: req.query.email
			}, function(err, player) {
				if (err || !player) {
					res.paramError(err, 'User not found!');
				} else {
					if(passwordHash.verify(req.query.password, player.password)){
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
		} else {
			res.paramError('invalid params');
		}
	});

	app.get('/auth/register', function(req, res, next) {
		if(req.query != null && req.query.email != null && req.query.displayName && req.query.password){
			Player.findOne({
				email: req.query.email
			}, function(err, player) {
				if (err || !player) {
					var hashedPassword = passwordHash.generate(req.query.password);
					var newplayer = new Player({
						displayName: req.query.displayName,
						password: hashedPassword,
						email: req.query.email,
					});
					newplayer.save(function(err, newplayer) {
						if (err) return res.internalError(err);
						res.redirect('/auth/login?email='+req.query.email+'&password='+req.query.password)
					});
				} else {
					res.paramError('Email already registered!', 'Email already registered!');
				}
			});
		} else {
			res.paramError('invalid params');
		}
	});



	return app;
};
