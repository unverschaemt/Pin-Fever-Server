var express = require('express');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Player = require('../database/models/Player.js');
var Turn = require('../database/models/Turn.js');
var TurnBasedMatch = require('../database/models/TurnBasedMatch.js');
var MatchOperations = require('./MatchOperations.js');
var autoGames = {};

var quickId = require('../utils/quickId.js');
var loadAuthPlayer = require('../utils/loadAuthPlayer.js');
var querySelects = require('../config/querySelects.js');

var expiredMillis = 1000 * 60;

var createMatch = function(participants, initialData, mode, callback) {
	var match = new TurnBasedMatch({
		data: initialData,
		mode: mode,
		participants: participants,
		status: 'MATCH_ACTIVE',
		turns: []
	});
	match.save(callback);
}

module.exports = function() {
	var app = express();

	app.use(MatchOperations());

	//app.use('/findauto', loadAuthPlayer())

	app.post('/create', jsonParser, function(req, res, next) {
		console.log(typeof req.body.participants);
		if (req.body == null || req.body.participants == null || typeof req.body.participants !== 'object') {
			return res.paramError('invalid params', 'Invalid parameters!');
		}
		req.body.initialData = req.body.initialData || {};
		req.body.mode = req.body.mode || {};
		req.body.participants.unshift(req.auth._id);
		createMatch(req.body.participants, req.body.initialData, req.body.mode, function(err, match) {
			if (err) return res.internalError(err);
			res.success({
				TurnBasedMatch: match
			});
		});
	});

	app.get('/getautogame/:autoId', function(req, res, next) {
		if (req.params == null || req.params.autoId == null) {
			return res.paramError('invalid params', 'no param');
		}
		if (autoGames[req.params.autoId] != null) {
			return res.notFoundError('invalid params', 'Autogame not found!');
		}
		if (Date.now() - autoGames[req.params.autoId].created > expiredMillis) {
			return res.internalError('Autogame expired!', 'Autogame expired!');
		}
		res.success({
			autoGame: autoGames[req.params.autoId]
		});
	});

	app.post('/findauto', jsonParser, loadAuthPlayer(), function(req, res, next) {
		if (req.body == null) {
			res.paramError('invalid params', 'no param');
		}
		var numberOfPlayers = parseInt(req.body.numberOfPlayers) || 2;
		var minLevel = parseInt(req.body.minLevel) || 0;
		var mode = req.body.mode || 'default';
		var initialData = req.body.initialData || {};

		for (var i in autoGames) {
			var openGame = autoGames[i];
			if (openGame.participants.indexOf(req.auth._id) >= 0) {
				return res.success({
					autoGame: openGame
				});
			}
			var checkLevel = openGame.minLevel <= req.player.level;
			var checkMode = openGame.mode === mode;
			var checkState = openGame.state === 'WAIT_FOR_PLAYERS';
			var checkExpired = Date.now() - openGame.created <= expiredMillis;
			if (checkLevel && checkMode && checkState && checkExpired) {
				openGame.participants.push(req.auth._id);
				if (openGame.participants.length === openGame.numberOfPlayers) {
					return createMatch(openGame.participants, openGame.initialData, openGame.mode, function(err, match){
						if(err){
							return res.internalError('Database fail!');
						}
						openGame.state = 'WAIT_FOR_START';
						openGame.matchId = match._id.toString();
						return res.success({
							autoGame: openGame
						});
					});
				} else {
					return res.success({
						autoGame: openGame
					});
				}
			}
		}
		var id = quickId() + 'PID' + req.auth._id;
		while (autoGames[id] != null) {
			id = quickId() + 'PID' + req.auth._id;
		}

		autoGames[id] = {
			_id: id,
			state: 'WAIT_FOR_PLAYERS',
			mode: mode,
			matchId: null,
			participants: [req.auth._id],
			numberOfPlayers: numberOfPlayers,
			minLevel: minLevel,
			initialData: initialData,
			created: Date.now()
		};
		res.success({
			autoGame: autoGames[id]
		});
	});

	return app;
};