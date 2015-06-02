var mongoose = require('mongoose');
var random = require('mongoose-random');

var Schema = mongoose.Schema;

var questionSchema = new Schema({
	question: {
		type: Schema.ObjectId,
		ref: 'Translation'
	},
	answer: {
		coordinates: {
			latitude: Number,
			longitude: Number
		},
		text: {
			type: Schema.ObjectId,
			ref: 'Translation'
		}
	},
	category: {
		type: Schema.ObjectId,
		ref: 'Category'
	}
});

questionSchema.plugin(random, {
	path: 'r'
});

module.exports = mongoose.model('Question', questionSchema);