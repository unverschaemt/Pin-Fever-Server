var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var turnBasedMatchesSchema = new Schema({
	mode: String,
	status: {
		type: String,
		enum: ['MATCH_AUTO_MATCHING', 'MATCH_ACTIVE', 'MATCH_COMPLETE', 'MATCH_CANCELED', 'MATCH_EXPIRED', 'MATCH_DELETED']
	},
	userMatchStatus: String,
	inviterId: {
		type: Schema.ObjectId,
		ref: 'Player'
	},
	level: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('TurnBasedMatches', turnBasedMatchesSchema);
