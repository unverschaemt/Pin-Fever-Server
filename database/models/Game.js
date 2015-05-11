var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    state: Number,
    activeRound: String
});

module.exports = mongoose.model('Game', fileSchema);
