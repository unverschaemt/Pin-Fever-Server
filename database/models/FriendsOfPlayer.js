var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    playerID: String,
    friendID: String
});

module.exports = mongoose.model('FriendsOfPlayer', fileSchema);
