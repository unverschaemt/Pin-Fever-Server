var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var translationSchema = new Schema({
});

module.exports = mongoose.model('Translation', translationSchema);
