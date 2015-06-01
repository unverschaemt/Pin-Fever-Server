var express = require('express');
var mongoose = require('mongoose');

var playerIdMe = require('../utils/playerIdMe.js');
var Question = require('../database/models/Question.js');
var Text = require('../database/models/Text.js');
var Translation = require('../database/models/Translation.js');
var Language = require('../database/models/Language.js');
var Category = require('../database/models/Category.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var querySelects = require('../config/querySelects.js');

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

	app.post('/add', jsonParser, function(req, res) {
		var out = [];
		for (var i in mongoose.models) {
			out.push([mongoose.models[i].modelName, i]);
		}
		var da = new mongoose.models[req.body.model](req.body.data);
		da.save(function(err, das) {
			if (err) {
				return res.internalError('Database error!', err);
			}
			res.success(das);
		});
	});

	app.get('/randomcategories', function(req, res) {
		req.query.amount = req.query.amount || 1;
		var query = Category.findRandom();
		query.limit(req.query.amount);
		query.exec(function(err, categories) {
			if (err) {
				return res.internalError('Database error!');
			}
			res.success({
				categories: categories
			});
		});
	});

	app.get('/random', function(req, res) {
		req.query.amount = req.query.amount || 1;
		req.query.language = req.query.language || 'en';
		req.query.category = req.query.category || false;

		var query = Question.findRandom();
		if (req.query.category) {
			query.where({
				category: mongoose.Types.ObjectId(req.query.category)
			});
		}
		query.limit(req.query.amount);
		query.exec(function(err, questions) {
			if (err) {
				return res.internalError('Database error!');
			}
			var languageQuery = Text.find();
			languageQuery.populate('language');
			var orquery = [];
			for (var i in questions) {
				orquery.push({
					'_language.lkz': req.query.language,
					_translation: mongoose.Types.ObjectId(questions[i].question)
				});
				orquery.push({
					'_language.lkz': req.query.language,
					_translation: mongoose.Types.ObjectId(questions[i].answer.text)
				});
			}

			languageQuery.or(orquery);
			query.exec(function(err, texts) {
				if (err) {
					return res.internalError('Database error!');
				}
				var textsObj = {};
				for (var i in texts) {
					textsObj[texts[i]._translation.toString()] = texts[i];
				}
				for (var i in questions) {
					questions[i].question = textsObj[questions[i].question.toString()];
				}
				res.success({
					questions: questions
				});
			});
		});
	});

	return app;
};