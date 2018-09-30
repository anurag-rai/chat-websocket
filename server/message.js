const utils = require('../utility/utils');

function getRecepient(input) {
	return utils.getFirstWord(input);
}

function getSender(input) {
	var rest = utils.getRestWords(input);
	return utils.getFirstWord(rest);
}

function getMessage(input) {
	var rest = utils.getRestWords(input);
	return utils.getRestWords(rest);
}

module.exports = {
	get: function(input) {
		var rest = utils.getRestWords(input);
		const recepient = getRecepient(rest);
		const sender = getSender(rest);
		const message = getMessage(rest);
		console.log(`Recepient: ${recepient}, Sender: ${sender}, Message: ${message}`);
		var valid = true;
		const payload = {
			recepient: recepient,
			sender: sender,
			message: message,
			valid: valid
		}
		return payload;
	},

	createResponse: function(sender, message) {
		return 'message' + ' ' + sender + ' ' + message;
	}
};