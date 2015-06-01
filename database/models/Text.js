var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
	_translation: {
		type: Schema.ObjectId,
		ref: 'Translation'
	},
	content: String,
	_language: {
		type: Schema.ObjectId,
		ref: 'Language'
	}
});

module.exports = mongoose.model('Game', fileSchema);