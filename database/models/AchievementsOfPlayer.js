var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    playerID: String,
    achievementID: String
});

module.exports = mongoose.model('AchievementsOfPlayer', fileSchema);
