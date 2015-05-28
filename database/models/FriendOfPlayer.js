var mongoose = require('mongoose');
var Player = require('./Player.js');

var Schema = mongoose.Schema;

var friendOfPlayerSchema = new Schema({
    playerId: {type: Schema.ObjectId, ref: 'Player'},
    friendId: {type: Schema.ObjectId, ref: 'Player'}
});

module.exports = mongoose.model('FriendOfPlayer', friendOfPlayerSchema);
