const utils = require('./utils');

function getRecepient(input) {
	return utils.getFirstWord(input);
}

function getSender(input) {
	var rest = utils.getRestWords(input);
	return utils.getFirstWord(rest);
}

function getMessage(input) {
	var rest = utils.getRestWords(input);
	console.log("Message: rest ", rest);
	console.log("returning ", utils.getRestWords(rest));
	return utils.getRestWords(rest);
}

module.exports = {
	get: function(input) {
		var rest = utils.getRestWords(input);
		const recepient = getRecepient(rest);
		const sender = getSender(rest);
		const message = getMessage(rest);
		console.log(`${recepient}, Sender: ${sender}, Message: ${message}`);
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