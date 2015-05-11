var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    nameKey: String,
    descriptionKey: String,
    color: String
});

module.exports = mongoose.model('Achievement', fileSchema);
