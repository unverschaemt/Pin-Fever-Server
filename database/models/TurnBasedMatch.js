var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var turnBasedMatchSchema = new Schema({
	mode: String,
	status: {
		type: String,
		enum: ['MATCH_ACTIVE', 'MATCH_COMPLETE', 'MATCH_CANCELED']
	},
	participants: [{
		type: Schema.ObjectId,
		ref: 'Player'
	}],
	data: {
		type: Object,
		default: {}
	},
	turns: [{
		type: Schema.ObjectId,
		ref: 'Turn'
	}]
});

module.exports = mongoose.model('TurnBasedMatch', turnBasedMatchSchema);