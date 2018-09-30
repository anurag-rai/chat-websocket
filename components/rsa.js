const NodeRSA = require('node-rsa');
const key = new NodeRSA({b: 512});

module.exports = {

	decryptMessage: function(message) {
		return key.decrypt(message, 'utf8');
	},

	encryptMessage: function(message) {
		return key.encrypt(message.toString(), 'base64');
	}
};