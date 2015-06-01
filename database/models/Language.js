var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var languageSchema = new Schema({
    lkz: String,
    name: String,
    countries: Array
});

module.exports = mongoose.model('Language', languageSchema);
