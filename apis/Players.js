var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');

var playerIdMe = require('../utils/playerIdMe.js');
var Player = require('../database/models/Player.js');
var FriendOfPlayer = require('../database/models/FriendOfPlayer.js');
var Upload = require('./Upload.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		if (req.auth == null || req.auth._id == null || req.auth.login !== true) {
			/*if (req.auth == null) {
				req.auth = {};
				req.auth._id = "MyTestId";
			}*/
			//next();
			res.unauthorizedError('Login needed for this section!');
		} else {
			next();
		}
	});

	app.use('/players/me/avatarupload', Upload());

	app.get('/players/:playerId/img.jpeg', function(req, res) {
		if (req.params != null && req.params.playerId != null) {
			req.params.playerId = playerIdMe(req, req.params.playerId);
			fs.readFile('./uploads/' + req.params.playerId + '.jpeg', function(err, data) {
				if (err) {
					return fs.readFile('./uploads/defaultAvatar.jpeg', function(err, data) {
						if (err) {
							return res.notFoundError("File not found.", "File not found.");
						}
						res.setHeader("Content-Type", "image/jpeg");
						res.writeHead(200);
						res.end(data);
					});
				}
				res.setHeader("Content-Type", "image/jpeg");
				res.writeHead(200);
				res.end(data);
			});
		} else {
			res.paramError('invalid params', 'no param');
		}
	});

	/*app.get('/players/test', function(req, res) {
		res.send('<script src="http://cdn.rawgit.com/bauhausjs/bauhausjs/master/files/client/files/cropImages.js"></script><form action="/players/me/avatarupload" method="post" enctype="multipart/form-data"><input name="Datei" type="file" size="50" accept="image/jpeg"><input type="submit"></form>');
	});*/

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
		} else {
			res.paramError('invalid params', 'no param');
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
		} else {
			res.paramError('invalid params', 'no param');
		}
	});

	app.post('/players/me/addfriend/:playerId', jsonParser, function(req, res) {
		if (req.params != null && req.params.playerId != null) {
			var language = req.query.language || 'EN';
			FriendOfPlayer.findOne(function(err, friend) {
				if (err) {
					console.log('err', err);
					return res.internalError('Database error!');
				}
				if (friend) {
					return res.paramError('Already a friend!', 'Already a friend!');
				}
				var newfriend = new FriendOfPlayer({
					playerId: req.auth._id,
					friendId: req.params.playerId
				});
				newfriend.save(function(err, newfriend) {
					if (err) return res.internalError(err);
					res.success();
				});

			}).or([{
				playerId: mongoose.Types.ObjectId(req.auth._id),
				friendId: mongoose.Types.ObjectId(req.params.playerId)
			}, {
				friendId: mongoose.Types.ObjectId(req.auth._id),
				playerId: mongoose.Types.ObjectId(req.params.playerId)
			}]);
		} else {
			res.paramError('invalid params', 'no param');
		}
	});

	app.post('/players/me/removefriend/:playerId', jsonParser, function(req, res) {
		if (req.params != null && req.params.playerId != null) {
			var language = req.query.language || 'EN';
			FriendOfPlayer.find().or([{
				playerId: mongoose.Types.ObjectId(req.auth._id),
				friendId: mongoose.Types.ObjectId(req.params.playerId)
			}, {
				friendId: mongoose.Types.ObjectId(req.auth._id),
				playerId: mongoose.Types.ObjectId(req.params.playerId)
			}]).remove(function(err, friends) {
				if (err) {
					console.log('err', err);
					return res.internalError('Database error!');
				}
				res.success();
			});
		} else {
			res.paramError('invalid params', 'no param');
		}
	});

	app.get('/players/me/friends', function(req, res) {
		var language = req.query.language || 'EN';

		var k = 2;
		var arr = [];
		var done = function(friends) {
			k--;
			arr.push(friends);
			if (k < 1) {
				var out = [];
				for (var i in arr) {
					for (var j in arr[i]) {
						if (typeof arr[i][j].friendId === 'object') {
							out.push(arr[i][j].friendId);
						}
						if (typeof arr[i][j].playerId === 'object') {
							out.push(arr[i][j].playerId);
						}
					}
				}
				res.success({
					friends: out
				});
			}
		}

		FriendOfPlayer.find(function(err, friends) {
			if (err) {
				console.log('err', err);
				return res.internalError('Database error!');
			}
			done(friends);
		}).where({
			playerId: mongoose.Types.ObjectId(req.auth._id)
		}).select('friendId').populate('friendId', 'avatarImageUrl displayName email level _id');

		FriendOfPlayer.find(function(err, friends) {
			if (err) {
				console.log('err', err);
				return res.internalError('Database error!');
			}
			done(friends);
		}).where({
			friendId: mongoose.Types.ObjectId(req.auth._id)
		}).select('playerId').populate('playerId', 'avatarImageUrl displayName email level _id');
	});

	app.get('/players/search/:key', function(req, res) {
		if (req.params != null && req.params.key) {
			var limit = req.query.limit || 10;
			try {
				Player.find(function(err, players) {
					if (err) {
						console.log('err', err);
						return res.internalError('Database error!');
					}
					res.success({
						players: players
					});
				}).or([{
					email: new RegExp(req.params.key, "i")
				}, {
					displayName: new RegExp(req.params.key, "i")
				}]).select('avatarImageUrl displayName email level _id').limit(limit);
			} catch (e) {
				res.paramError('Invalid Search Key!', 'Invalid Search Key!');
			}
		} else {
			res.paramError('invalid params', 'no param');
		}
	});

	return app;
};
