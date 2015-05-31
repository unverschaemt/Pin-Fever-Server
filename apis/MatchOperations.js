var express = require('express');
var mongoose = require('mongoose');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Player = require('../database/models/Player.js');
var Turn = require('../database/models/Turn.js');
var TurnBasedMatch = require('../database/models/TurnBasedMatch.js');

var querySelects = require('../config/querySelects.js');

var loadAuthPlayer = require('../utils/loadAuthPlayer.js');

module.exports = function() {
	var app = express();

	app.get('/:matchId/get', function(req, res, next) {
		if (req.params == null || req.params.matchId == null) {
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
				return res.internalError('Database error!');
			}
			res.success({
				TurnBasedMatch: match
			});
		});
	});

	app.post('/:matchId/taketurn', jsonParser, function(req, res, next) {
		if (req.params == null || req.params.matchId == null || req.body == null || req.body.turndata == null) {
			return res.paramError('invalid params', 'no param');
		}
		req.body.gamedata = req.body.gamedata || false;
		req.body.participants = req.body.participants || false;
		req.body.matchcomplete = req.body.matchcomplete === true;

		var query = TurnBasedMatch.findOne();
		query.where({
			_id: mongoose.Types.ObjectId(req.params.matchId)
		});
		query.exec(function(err, match) {
			if (err) {
				return res.internalError('Database error!');
			}
			if (match.status !== 'MATCH_ACTIVE') {
				return res.paramError('Game not active!', 'Match not active!');
			}
			if (match.participants[match.turns.length % match.participants.length] != null || match.participants[match.turns.length % match.participants.length].toString() !== req.auth._id) {
				return res.paramError('Not your Turn!', 'Not your Turn!');
			}
			var turn = new Turn({
				_player: req.auth._id,
				data: req.body.turndata
			});
			turn.save(function(err, turn) {
				if (err) {
					return res.internalError('Database error!');
				}
				match.turns.push(turn._id);
				if (req.body.gamedata && typeof req.body.gamedata === 'object') {
					match.data = req.body.gamedata;
				}
				if (req.body.participants && typeof req.body.participants === 'object') {
					if (match.participants.length === req.body.participants.length) {
						for (var i in match.participants) {
							if (req.body.participants.indexOf(match.participants[i]) >= 0) {
								
							}
						}
						match.participants = req.body.participants;
					}
				}
				if (req.body.matchfinished) {
					match.status = 'MATCH_COMPLETE';
				}
				match.save(function(err, match) {
					if (err) {
						return res.internalError('Database error!');
					}
					res.success({
						TurnBasedMatch: match
					});
				});
			});
		});
	});



	return app;
};