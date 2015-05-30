var express = require('express');
var mongoose = require('mongoose');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Player = require('../database/models/Player.js');
var TurnBasedMatch = require('../database/models/TurnBasedMatch.js');
var querySelects = require('../config/querySelects.js');

var loadAuthPlayer = require('../utils/loadAuthPlayer.js');

module.exports = function() {
	var app = express();

	app.get('/:matchId/get', function(req, res, next) {
		if (req.params.matchId == null) {
			return res.paramError('invalid params', 'no param');
		}
		req.query.populate = req.query.populate || '';
		var populate = req.query.populate.split(' ');

		var query = TurnBasedMatch.findOne();
		query.where({
			_id: mongoose.Types.ObjectId(req.params.matchId)
		});
		if (populate.indexOf('turns') >= 0) {
			query.populate('turns');
		}
		if (populate.indexOf('participants') >= 0) {
			query.populate('participants', querySelects.publicPlayer);
		}

		query.exec(function(err, match) {
			if (err) {
				console.log('err', err);
				return res.internalError('Database error!');
			}
			res.success({
				TurnBasedMatch: match
			});
		});
	});



	return app;
};