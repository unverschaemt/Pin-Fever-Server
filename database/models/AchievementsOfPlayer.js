var mongoose = require('mongoose');
var Player = require('./Player.js');
var Achievement = require('./Achievement.js');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    playerID: {type: Schema.ObjectId, ref: 'Player'},
    achievementID: {type: Schema.ObjectId, ref: 'Achievement'}
});

module.exports = mongoose.model('AchievementsOfPlayer', fileSchema);
