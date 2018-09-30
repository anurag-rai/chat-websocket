const WebSocket = require('ws');

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

const messageParser = require('./message');

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
		console.log("Sending to client: ", message.toString());
		ws.send(message.toString());
	}
});


function handleMessageFromClient (connection, message) {
	const action = decodeAction(message);
	if ( action === 'register' ) {
		return registerUser(message, connection);
	} else if ( action === 'message' ) {
		return sendMessage(message);
	} else if ( action === 'cmd' ) {

	} else {
		// No such action
		return 'Not allowed';
	}
}


function registerUser(task, connection) {
	const username = utils.getRestWords(task);
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
	const payload = messageParser;
	const recepient = getRecepient(task);
	const sender = getSender(task);
	const message = getMessage(task);
	// check if userName is a connected client
	var found = clients.find(function(element) {
	  return element.username === recepient;
	});
	if ( found === undefined )
		return 'The user is not online';
	console.log(`Sending message to ${found.username}, message ${message}`);
	found.link.send(message.toString());
	return 'sent message';
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