var mongoose = require('mongoose');
var random = require('mongoose-random');

var Schema = mongoose.Schema;

var categorySchema = new Schema({
    name: String
});

categorySchema.plugin(random, {
	path: 'r'
});

module.exports = mongoose.model('Category', categorySchema);
