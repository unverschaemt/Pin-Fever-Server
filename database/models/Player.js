var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
	avatarImageUrl: String,
	displayName: String,
	password: String,
	email: String,
	level: { type: Number, default: 0 }
});

module.exports = mongoose.model('Player', fileSchema);
