var express = require('express');
var Game = require('../database/models/Game.js');

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		if (req.auth == null || req.auth._id == null || req.auth.login !== true) {
			res.unauthorizedError('Login needed for this section!');
		} else {
			next();
		}
	});

	app.get('/getgamebyid/:id', function(req, res) {
		if (req.params != null && req.params.id) {
			Game.findOne({
				_id: req.params.id
			}, function(err, game) {
				if (err || !game) {
					res.paramError(err, 'Game not found!');
				} else {
					res.success({
						game: game
					});
				}
			});
		}
	});

	return app;
};
