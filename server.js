const WebSocket = require('ws');
const utils = require('./utils');
const messageParser = require('./message');

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
		console.log('received: %s', message);
		const reply = handleMessageFromClient(ws, message);
		console.log("REPLY: ", reply);
		sendToClient(reply);
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
	const recepient = payload.recepient;
	const sender = payload.sender;
	const message = payload.message;
	if ( payload.valid == false )
		return 'parseError'
	// check if userName is a connected client
	var found = clients.find(function(element) {
	  return element.username === recepient;
	});
	if ( found === undefined )
		return 'notOnline';
	console.log(`Sending message to ${found.username}, message ${message}`);
	var response = messageParser.createResponse(sender, message);
	sendExplicitlyToClient(found.link, response);
	return 'sent message';
}


function sendExplicitlyToClient(connection, message) {
	console.log("Sending to client: ", message.toString());
	connection.send(message.toString());
}


function checkActionValidity(input) {
	if ( input === 'register' || input === 'message' || input === 'cmd')
		return true;
	return false;
}

function checkTaskValidity(input) {
	if ( input === '' )
		return false;
	return true;
}