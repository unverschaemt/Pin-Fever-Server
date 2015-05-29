var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');

var playerIdMe = require('../utils/playerIdMe.js');
var Player = require('../database/models/Player.js');
var FriendOfPlayer = require('../database/models/FriendOfPlayer.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

module.exports = function() {
	var app = express();

	app.use(function(req, res, next){
		console.log('Upload header', req.headers);
	});

	/*app.use(function(req, res, next) {
		if (req.auth == null || req.auth._id == null || req.auth.login !== true) {
			res.unauthorizedError('Login needed for this section!');
		} else {
			next();
		}
	});*/

	app.use(function(req, res, next) {
		req.multerErrors = 0;
		req.accepts('*');
		next();
	});

	app.use(multer({
		dest: './uploads/',
		onFileUploadStart: function(file, req, res) {
			console.log('started upload');
			if (file.mimetype !== 'image/jpeg') {
				return false;
			} else {
				return true;
			}
		},
		onFileUploadComplete: function(file, req, res) {
			req.multerUpload = true;

		},
		onError: function(err, req, res) {
			req.multerUpload = true;
			req.multerErrors++;
		},
		rename: function(fieldname, filename, req, res) {
			return req.auth._id;
		}
	}));

	app.post('/', function(req, res) {
		if (req.multerUpload && req.multerErrors < 1) {
			res.success();
		} else {
			res.internalError('Upload failed!');
		}
	});

	return app;
};
