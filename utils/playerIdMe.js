
module.exports = function(req, id){
	if(id === 'me'){
		return req.auth._id;
	}
	return id;
}
