module.exports = {

	getFirstWord: function(input) {
		var arr = input.trim().split(/(\s+)/);
	    return arr[0].trim();
	},

	getRestWords: function(input) {
		var arr = input.trim().split(/(\s+)/);
	    var rest = '';
	    for(var i = 1; i < arr.length; i++){
	        rest += arr[i] + ' ';
	    }
	    return rest.trim();
	}
};