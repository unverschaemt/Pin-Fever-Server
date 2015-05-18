var express = require('express');
var mongoose = require('mongoose');
var auth = require('./auth/index.js');

var app = express();

// Loading Database:
var db = mongoose.connect('mongodb://localhost/pinfever');

var port = 3333;

app.listen(port, function() {
	console.log("STARTED pinfever SERVER! PORT: ", port);
});

app.use(auth());
