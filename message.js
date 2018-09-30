const utils = require('./utils');

function getSender(input) {
	return utils.getFirstWord(input);
}

function getRecepient(input) {
	var rest = utils.getRestWords(input);
	return utils.getFirstWord(rest);
}

function getMessage(input) {
	var rest = utils.getRestWords(input);
	return utils.getRestWords(rest);
}

module.exports = {
	get: function(input) {
		const recepient = getRecepient(input);
		const sender = getSender(input);
		const message = getMessage(input);
		var valid = true;
		const payload = {
			recepient: recepient,
			sender: sender,
			message: message,
			valid: valid
		}
		return payload;
	}
};