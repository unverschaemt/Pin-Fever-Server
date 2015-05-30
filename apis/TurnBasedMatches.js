var express = require('express');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Player = require('../database/models/Player.js');
var autoGames = {};

var quickId = require('../utils/quickId.js');
var loadAuthPlayer = require('../utils/loadAuthPlayer.js');

var expiredMillis = 1000 * 60;

module.exports = function() {
	var app = express();

	app.post('/create', jsonParser, function(req, res, next) {
		if (req.body != null && req.body.email != null && req.body.password != null) {
			loginUser(req.body.email, req.body.password, res);
		} else {
			res.paramError('invalid params', 'no param');
		}
	});

	app.get('/getautogame/:id', function(req, res, next) {
		if (req.params == null || req.params.id == null) {
			return res.paramError('invalid params', 'no param');
		}
		if (autoGames[req.params.id] != null) {
			return res.notFoundError('invalid params', 'Autogame not found!');
		}
		if (Date.now() - autoGames[req.params.id].created > expiredMillis) {
			return res.internalError('Autogame expired!', 'Autogame expired!');
		}
		res.success({
			autoGame: autoGames[req.params.id]
		});
	});

	app.post('/findauto', jsonParser, loadAuthPlayer, function(req, res, next) {
		if (req.body == null) {
			res.paramError('invalid params', 'no param');
		}
		var number = parseInt(req.body.number) || 2;
		var minLevel = parseInt(req.body.minlevel) || 0;
		var mode = req.body.mode || 'default';

		for (var i in autoGames) {
			var openGame = autoGames[i];
			var checkLevel = openGame.minLevel <= req.player.level;
			var checkMode = openGame.mode === mode;
			var checkState = openGame.state === 'WAIT_FOR_PLAYERS';
			var checkExpired = Date.now() - autoGames[req.params.id].created <= expiredMillis;
			if (checkLevel && checkMode && checkState && checkExpired) {
				openGame.participants.push(req.auth._id);
				if (openGame.participants.length === openGame.number) {
					openGame.state = 'WAIT_FOR_START';
					// TODO: CREATE A NEW GAME AND START THE GAME
				}
				return res.success({
					autoGame: openGame
				});
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
			gameId: null,
			participants: [req.auth._id],
			number: number,
			minLevel: minLevel,
			created: Date.now()
		};
		res.success({
			autoGame: autoGames[id]
		});
	});

	return app;
};