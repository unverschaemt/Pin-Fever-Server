var express = require('express');

var Player = require('../database/models/Player.js');

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		if (req.auth != null && req.auth._id != null) {
			Player.findOne({
				_id: req.auth._id
			}, function(err, player) {
				if (err) {
					return res.internalError('Database error or user not found!');
				}
				if(!player){
					res.unauthorizedError('Login needed for this section!');
				}
				req.player = player;
				next();
			}).select('displayName level _id email');
		} else {
			res.unauthorizedError('Login needed for this section!');
		}
	});

	return app;
};