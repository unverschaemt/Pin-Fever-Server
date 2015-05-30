var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var turnSchema = new Schema({
	_player: {
		type: Schema.ObjectId,
		ref: 'Player'
	},
	data: {
		type: Object,
		default: {}
	}
});

module.exports = mongoose.model('Turn', turnSchema);