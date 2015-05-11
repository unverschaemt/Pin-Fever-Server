var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    category: String,
    game: String
});

module.exports = mongoose.model('Round', fileSchema);
