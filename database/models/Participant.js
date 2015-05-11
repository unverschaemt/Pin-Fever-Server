var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    player: String,
    game: String,
    status: Number,
    score: Number
});

module.exports = mongoose.model('Participant', fileSchema);
