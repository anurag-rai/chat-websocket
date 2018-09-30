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
		const recepient = getRecepient(task);
		const sender = getSender(task);
		const message = getMessage(task);
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