var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    avatarURL: String,
    displayName: String,
    password: String,
    email: String,
    score: Number
});

module.exports = mongoose.model('Player', fileSchema);
