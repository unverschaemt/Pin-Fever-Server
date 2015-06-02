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

var setTranslationText = function(translationID, languageID, textPARAM, callback) {
	Translation.findOne({
		_id: translationID
	}, function(err, translation) {
		if (err || !translation) {
			return callback('failed');
		}
		Text.findOne({
			_translation: translation._id,
			language: languageID
		}, function(err, text) {
			if (err) {
				return callback('failed');
			}
			if (!text) {
				var text = new Text({
					_translation: translation._id,
					language: languageID
				});
			}
			text.content = textPARAM;
			text.save(function(err, text) {
				if (err) {
					return callback('failed');
				}
				callback(null, text)
			})
		});
	});
}

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

	app.post('/addquestion', jsonParser, function(req, res) {
		req.body.coordinates = req.body.coordinates || {};
		if(typeof req.body.coordinates !== 'object' || req.body.coordinates.latitude == null || req.body.coordinates.longitude == null || typeof req.body.coordinates.latitude !== 'number' || typeof req.body.coordinates.longitude !== 'number'){
			return res.paramError('coordinates must be an object','coordinates must be an object with latitude and longitude');
		}

		Category.findOne({
			_id: req.body.category
		}, function(err, category) {
			if (err || !category) {
				return res.paramError('Database error!', 'Category not found!');
			}
			var questionText = new Translation();
			questionText.save(function(err, questionText) {
				if (err) {
					return res.internalError('Database error!', err);
				}
				var answerText = new Translation();
				answerText.save(function(err, answerText) {
					if (err) {
						return res.internalError('Database error!', err);
					}
					var question = new Question({
						question: questionText._id,
						answer: {
							text: answerText._id,
							coordinates: req.body.coordinates
						},
						category: category._id
					});
					question.save(function(err, question) {
						if (err) {
							return res.internalError('Database error!', err);
						}
						res.success(question);
					});
				});
			});
		});
	});

	app.post('/setquestiontext/:questionId', jsonParser, function(req, res) {
		if (req.body.text == null) {
			return res.paramError('', 'no param');
		}
		req.body.language = req.body.language || 'en';

		Question.findOne({
			_id: req.params.questionId
		}, function(err, question) {
			if (err || !question) {
				return res.paramError('Database error!', 'Question not found!');
			}
			setTranslationText(question.question, req.body.language, req.body.text, function(err, text) {
				if (err || !text) {
					return res.paramError('Database error!', 'Failed!');
				}
				res.success({
					text: text
				});
			});
		})
	});

	app.post('/setanswertext/:questionId', jsonParser, function(req, res) {
		if (req.body.text == null) {
			return res.paramError('', 'no param');
		}
		req.body.language = req.body.language || 'en';

		Question.findOne({
			_id: req.params.questionId
		}, function(err, question) {
			if (err || !question) {
				return res.paramError('Database error!', 'Question not found!');
			}
			setTranslationText(question.answer.text, req.body.language, req.body.text, function(err, text) {
				if (err || !text) {
					return res.paramError('Database error!', 'Failed!');
				}
				res.success({
					text: text
				});
			});
		})
	});

	app.post('/addcategory', jsonParser, function(req, res) {
		var categoryName = new Translation();
		categoryName.save(function(err, translation) {
			if (err || !translation) {
				return res.internalError('Database error!', 'Database error!');
			}
			var category = new Category({
				name: translation._id
			})
			category.save(function(err, category) {
				if (err || !category) {
					return res.internalError('Database error!', 'Database error!');
				}
				res.success({
					category: category
				});
			});
		});
	});

	app.post('/setcategorytext/:categoryId', jsonParser, function(req, res) {
		if (req.body == null || req.body.text == null) {
			return res.paramError('no param', 'no param');
		}
		req.body.language = req.body.language || 'en';

		Category.findOne({
			_id: req.params.categoryId
		}, function(err, category) {
			if (err || !category) {
				return res.paramError('Database error!', 'Question not found!');
			}
			setTranslationText(category.name, req.body.language, req.body.text, function(err, text) {
				if (err || !text) {
					return res.paramError('Database error!', 'Failed!');
				}
				res.success({
					text: text
				});
			});
		})
	});

	app.post('/addtext', jsonParser, function(req, res) {
		Translation.findOne({
			_id: req.body.translation
		}, function(err, translation) {
			if (err || !translation) {
				return res.paramError('Database error!', 'Category not found!');
			}
			Text.findOne({
				_translation: translation._id,
				language: req.body.language
			}, function(err, text) {
				if (err) {
					return res.internalError('Database error!');
				}
				if (!text) {
					var text = new Text({
						_translation: translation._id,
						language: req.body.language
					});
				}
				text.content = req.body.text;
				text.save(function(err, text) {
					if (err) {
						return res.internalError('Database error!');
					}
					res.success({
						text: text
					});
				})
			});
		});
	});

	return app;
};