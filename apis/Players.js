var express = require('express');
var playerIdMe = require('../utils/playerIdMe.js');
var Player = require('../database/models/Player.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		if (req.auth == null || req.auth._id == null || req.auth.login !== true) {
			res.unauthorizedError('Login needed for this section!');
		} else {
			next();
		}
	});

	app.get('/players/:playerId', function(req, res) {
		if (req.params != null && req.query != null && req.params.playerId != null) {
			req.params.playerId = playerIdMe(req, req.params.playerId);
			var language = req.query.language || 'EN';
			Player.findOne({
				_id: req.params.playerId
			}, function(err, player) {
				if (err || !player) {
					return res.internalError('Database error or user not found!');
				}
				res.success({
					player: player
				});
			}).select('avatarImageUrl displayName email level _id');
		}
	});

	app.get('/players/me/players/:collection', function(req, res) {
		if (req.params != null && req.query != null && req.params.collection != null) {
			var language = req.query.language || 'EN';
			var maxResults = req.query.maxResults || 10;
			var pageToken = req.query.pageToken || '';
			res.internalError('Not implemented!', 'Not implemented!');
		}
	});

	app.post('/players/me/set', jsonParser, function(req, res) {
		if (req.body != null) {
			var language = req.query.language || 'EN';
			Player.findOne({
				_id: req.auth._id
			}, function(err, player) {
				if (err || !player) {
					return res.internalError('Database error or user not found!');
				}
				for (var i in req.body) {
					if (['avatarImageUrl', 'displayName'].indexOf(i) >= 0) {
						player[i] = req.body[i];
					}
				}
				player.save(function(err, newplayer) {
					if (err) return res.internalError(err);
					res.success({
						player: newplayer
					});
				});
			}).select('avatarImageUrl displayName email level _id');
		}
	});

	return app;
};
