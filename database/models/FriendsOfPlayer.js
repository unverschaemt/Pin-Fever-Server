var mongoose = require('mongoose');
var Player = require('./Player.js');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    playerID: {type: Schema.ObjectId, ref: 'Player'},
    friendID: {type: Schema.ObjectId, ref: 'Player'}
});

module.exports = mongoose.model('FriendsOfPlayer', fileSchema);
