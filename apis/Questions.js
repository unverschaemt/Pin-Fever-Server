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

var randomcategories = function(req, res) {
	var query = Category.findRandom();
	query.limit(req.query.amount);
	query.select('_id name');
	query.exec(function(err, categories) {
		if (err) {
			return res.internalError('Database error!');
		}
		var languageQuery = Text.find();

		var orquery = [];
		for (var i in categories) {
			orquery.push({
				language: req.query.language,
				_translation: mongoose.Types.ObjectId(categories[i].name)
			});
		}

		languageQuery.or(orquery);

		languageQuery.exec(function(err, texts) {
			if (err) {
				return res.internalError('Database error!');
			}
			if (texts.length < orquery.length && req.query.language === 'en') {
				return res.internalError('Language text not found!', 'Language text not found!');
			}
			if (texts.length < orquery.length) {
				req.query.language = 'en';
				return randomcategories(req, res);
			}
			var textsObj = {};
			for (var i in texts) {
				textsObj[texts[i]._translation.toString()] = texts[i].content;
			}
			var outCategories = [];
			for (var i in categories) {
				var outCategory = {};
				outCategory._id = categories[i]._id;
				var oName = textsObj[categories[i].name.toString()];
				console.log('oName', oName);
				outCategory.name = oName;
				outCategories.push(outCategory);
			}
			res.success({
				categories: outCategories
			});
		});
	});
};

var randomquestions = function(req, res) {
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
		//languageQuery.populate('language');
		var orquery = [];
		for (var i in questions) {
			orquery.push({
				language: req.query.language,
				_translation: mongoose.Types.ObjectId(questions[i].question)
			});
			orquery.push({
				language: req.query.language,
				_translation: mongoose.Types.ObjectId(questions[i].answer.text)
			});
		}

		languageQuery.or(orquery);
		languageQuery.exec(function(err, texts) {
			if (err) {
				return res.internalError('Database error!');
			}
			if (texts.length < orquery.length && req.query.language === 'en') {
				return res.internalError('Language text not found!', 'Language text not found!');
			}
			if (texts.length < orquery.length) {
				req.query.language = 'en';
				return randomquestions(req, res);
			}
			var textsObj = {};
			for (var i in texts) {
				textsObj[texts[i]._translation.toString()] = texts[i].content;
			}
			var outQuestions = [];
			for (var i in questions) {
				var outQuestion = {};
				outQuestion._id = questions[i]._id;
				outQuestion.category = questions[i].category;
				outQuestion.answer = {};
				outQuestion.answer.coordinates = questions[i].answer.coordinates;
				var qtext = textsObj[questions[i].question.toString()];
				var atext = textsObj[questions[i].answer.text.toString()];
				outQuestion.question = qtext;
				outQuestion.answer.text = atext;
				outQuestions.push(outQuestion);
			}
			res.success({
				questions: outQuestions
			});
		});
	});
};

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

	app.get('/randomcategories', function(req, res) {
		req.query.amount = req.query.amount || 1;
		req.query.language = req.query.language || 'en';

		randomcategories(req, res);
	});

	app.get('/random', function(req, res) {
		req.query.amount = req.query.amount || 1;
		req.query.language = req.query.language || 'en';
		req.query.category = req.query.category || false;

		randomquestions(req, res);
	});

	return app;
};