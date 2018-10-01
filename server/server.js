const WebSocket = require('ws');
const cmd = require('node-cmd');
const path = require('path');

const utils = require('../utility/utils');
const messageParser = require('./message');
const rsaWrapper = require('../components/rsa-wrapper');

rsaWrapper.initLoadServerKeys(path.resolve(__dirname, '../'));
rsaWrapper.serverExampleEncrypt();

const wss = new WebSocket.Server({
  port: 7777,
  perMessageDeflate: {
    zlibDeflateOptions: { // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    clientMaxWindowBits: 10,       // Defaults to negotiated value.
    serverMaxWindowBits: 10,       // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10,          // Limits zlib concurrency for perf.
    threshold: 1024,               // Size (in bytes) below which messages
                                   // should not be compressed.
  }
});


var clients = [];


wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		// console.log('received: %s', message);
		// const decrypted = secureMessage.decryptMessage(message);
		const decrypted = rsaWrapper.decrypt(rsaWrapper.serverPrivate, message);
		const reply = handleMessageFromClient(ws, decrypted);
		console.log(reply);
		if ( reply === 'nosend' ) {
			// do not send
		} else {
			sendToClient(reply);
		}
	});
 	console.log("Client connected");
	sendToClient('connected');

	function sendToClient(message) {
		sendExplicitlyToClient(ws, message);
	}
});


function handleMessageFromClient (connection, message) {
	const action = utils.decodeAction(message);
	console.log("Action = ", action);
	if ( action === 'register' ) {
		return registerUser(message, connection);
	} else if ( action === 'message' ) {
		return sendMessage(message);
	} else if ( action === 'cmd' ) {
		return runCommand(message, connection);
	} else {
		// No such action
		return 'error';
	}
}


function registerUser(task, connection) {
	const name = utils.getRestWords(task);
	// check if this username is taken
	var found = clients.find(function(element) {
	  return element.username === name;
	});
	if ( found === undefined ) {
		console.log("Creating new user with name ", name);
		clients.push({username: name, link: connection});
		return 'registered';
	} else {
		return 'notRegistered Use different username';
	}
}

function sendMessage(task) {
	const payload = messageParser.get(task);
	if ( payload.valid == false )
		return 'parseError'
	// check if userName is a connected client
	var found = clients.find(function(element) {
	  return element.username === payload.recepient;
	});
	if ( found === undefined )
		return 'notOnline';
	console.log(`Sending message to ${found.username}, message ${payload.message}`);
	var response = messageParser.createResponse(payload.sender, payload.message);
	sendExplicitlyToClient(found.link, response);
	return 'sent message';
}


function runCommand(task,connection) {
	var command = utils.getRestWords(task);
	cmd.get(
		command, function(err, data, stderr){
			console.log(`Err: ${err}, data: ${data}, stderr: ${stderr}`);
            if (!err) {
               console.log('success: ', data);
               const response = 'ACK' + ' ' + data;
               sendExplicitlyToClient(connection, response);
            } else {
               console.log('error', err);
               const response = 'NOACK' + ' ' + err;
               sendExplicitlyToClient(connection, response);
            }
        }
	);
	return 'nosend';
}



function sendExplicitlyToClient(connection, message) {
	console.log("Sending to client: ", message.toString());
	// const encrypted = secureMessage.encryptMessage(message);
	// console.log("Key = ", secureMessage.getKey());
	// console.log("Encrypted: ", encrypted);
	// console.log("Decrypted: ", secureMessage.decryptMessage(encrypted));
	const encrypted = rsaWrapper.encrypt(rsaWrapper.clientPub, message.toString());
	// console.log("Encrypted: ", encrypted);
	// console.log("Decrypted: ", rsaWrapper.decrypt(rsaWrapper.clientPrivate, encrypted));
	connection.send(encrypted);
}
