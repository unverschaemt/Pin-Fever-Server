var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    question: String,
    lat: Number,
    long: Number
});

module.exports = mongoose.model('Answer', fileSchema);
