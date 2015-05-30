
var quickId = function(){
	var rand = ''+Math.round(Math.random()*1000000000000)+'';
	var time = ''+Date.now()+'';
	var id = 'QID'+rand+time+"XXXXXXXXXXXXXXXXXXXXXXXXXXXX";
	return id.substr(0, 28);
}

module.exports = quickId;