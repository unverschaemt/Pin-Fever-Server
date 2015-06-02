var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
	_translation: {
		type: Schema.ObjectId,
		ref: 'Translation'
	},
	content: String,
	language: String
});

module.exports = mongoose.model('Text', fileSchema);