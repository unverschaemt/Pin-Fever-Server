var express = require('express');

module.exports = function() {
	var app = express();

	app.use(function(req, res, next) {
		res.internalError = function(info, publicInfo) {
			publicInfo = publicInfo || null;
			res.status(500);
			res.json({
				err: 'Internal Server Error!',
				info: publicInfo
			});
		};
		res.paramError = function(info, publicInfo) {
			publicInfo = publicInfo || null;
			res.status(400);
			res.json({
				err: 'Bad Request!',
				info: publicInfo
			});
		};
		res.unauthorizedError = function(info, publicInfo) {
			publicInfo = publicInfo || null;
			res.status(401);
			res.json({
				err: 'Bad Request!',
				info: publicInfo
			});
		}
		res.success = function(data) {
			res.json({
				err: null,
				data: data
			});
		}
		next();
	});

	return app;
};
