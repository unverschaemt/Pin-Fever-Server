var fs = require('fs');

var file = fs.readFileSync(__dirname+'/secret.json');

var json = JSON.parse(file);

var secret = json.loginTokenKey;

module.exports = secret;