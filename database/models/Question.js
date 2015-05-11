var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    key: String,
    round: String,
    participantWhoWonThisRound: String,
    answer: String,
    questionState: Number
});

module.exports = mongoose.model('Question', fileSchema);
