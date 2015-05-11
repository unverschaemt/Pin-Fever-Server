var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    question: String,
    participant: String,
    lat: Number,
    long: Number,
    distance: Number
});

module.exports = mongoose.model('Turninformation', fileSchema);
