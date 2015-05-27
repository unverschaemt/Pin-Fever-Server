var express = require('express');
var mongoose = require('mongoose');
var auth = require('./auth/index.js');
var respondTypes = require('./utils/respondTypes.js');
var Players = require('./apis/Players.js');

var app = express();

// Loading Database:
var db = mongoose.connect('mongodb://localhost/pinfever');

var port = 8080;

app.listen(port, function() {
	console.log("STARTED pinfever SERVER! PORT: ", port);
});

app.use(respondTypes());

app.use(auth());

app.use(Players());

app.use(function(req, res, next){
	res.success({err: null, auth: req.auth});
})
