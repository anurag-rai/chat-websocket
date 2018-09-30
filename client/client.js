#!/usr/bin/env node

const utils = require('../utility/utils');
const secureMessage = require('../components/rsa');
const rsaWrapper = require('../components/rsa-wrapper');

const WebSocket = require('ws');
const path = require('path');

rsaWrapper.initLoadClientKeys(path.resolve(__dirname, '../'));

var readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Global state
var registered = false;
var username = '';

// CLI STDIN handling
rl.on('line', (stdinput) => {
    var input = '';
    if ( registered == false ) {
        // Validate username
        // console.log("Not a valid username. Enter again");
        username = stdinput;
        input = 'register ' + stdinput;
        sendToServer(input.toString());
    } else {
        input = stdinput;
        if ( input !== '') {
            //requires input validation (use regex)
            console.log("echo input is ", input);
            const message = decodeInput(input);
            if ( message === 'invalid' ) {
                console.log("Not a valid command");
            } else if ( message )
                sendToServer(message);
        }
    }
})

const ws = new WebSocket('ws://localhost:7777/', {
  perMessageDeflate: false
});
 
ws.on('open', function open() {
    console.log("Connecting to server ....")
});
 
ws.on('message', function incoming(data) {
    console.log("===================================");
    console.log("Received from server, ", data);
    // console.log("Key = ", secureMessage.getKey());
    // const decrypted = secureMessage.decryptMessage(data);
    const decrypted = rsaWrapper.decrypt(rsaWrapper.clientPrivate, data);

    const action = utils.getFirstWord(decrypted);
    console.log('Action: ', action);
    const task = utils.getRestWords(decrypted);
    console.log('Task: ', task);
    if ( action == 'connected' ) {
        console.log("Connected to the server ...");
        displayRegisterTemplate();
    } else if ( action === 'registered' ) {
        console.log("Registration done");
        registered = true;
        displayInputFormatTemplate();
    } else if ( action === 'notRegistered' ) {
        console.log("Not registered. Error: ", task);
    } else if ( action === 'message' ) {
        displayMessage(task); 
    } else if ( action === 'notOnline' ) {
        console.log("The other user is not online");
    } else if ( action === 'parseError') {
        console.log("Parse error in payload");
    } else if ( action === 'error') {
        console.log("Not allowed");
    } else if ( action === 'ACK' ) {
        console.log("ACK Received");
        console.log("Output: ");
        console.log(task);
    } else if ( action === 'NOACK' ) {
        console.log("NOACK Received");
        console.log(task);
    }
    else {
        console.log("Message Received: ", task);
    }
});

ws.on('close', function close(code, reason) {
    registered = false;
    username = '';
    console.log(`Closing WebSocket. Code: ${code}. Reason: ${reason}`);
})



function formatMessageToSend(username, input) {
    var arr = input.split(" ");
    const length = arr.length;
    if ( length <= 2 ) {
        return 'invalid';
    }
    var message = '';
    for(var i = 2; i < arr.length; i++){
        message += arr[i] + ' ';
    }
    return 'message' + ' ' + arr[1] + ' ' + username + ' ' + message.trim();
}

function formatCommandToSend(input) {
    // if ( /\s+/.test(input.trim()) ) {
    //     return 'invalid';
    // }
    return input.trim();
}


function decodeInput(input) {
    const action = utils.decodeAction(input);
    if ( action === 'message' ) {
        const formatedMessage = formatMessageToSend(username, input);
        if ( formatedMessage === 'invalid') {
            return 'invalid';
        }
        sendToServer(formatedMessage);
    } else if ( action === 'cmd') {
        const formatedMessage = formatCommandToSend(input);
        if ( formatedMessage === 'invalid') {
            return 'invalid';
        }
        sendToServer(formatedMessage);
    } else {
        return 'invalid';
    }
}


function displayMessage(task) {
    const sender = utils.getFirstWord(task);
    const message = utils.getRestWords(task);
    console.log(`${sender} ---> ${message}`);
}

function displayInputFormatTemplate() {
    console.log("======================================================");
    console.log("Format for input: ");
    console.log("To send a message to user_name, use: (without < and >)");
    console.log("message user_name <message>");
    console.log("To send a message to user_name, use:");
    console.log("run <command>");
    console.log("======================================================");
}

function displayRegisterTemplate() {
    console.log("======================================================");
    console.log(" ]] Enter username to register on the server ");
}

function sendToServer(message) {
    console.log("Sending to server: ", message.toString());
    // const encrypted = secureMessage.encrypMessage(message.toString(), 'base64');
    const encrypted = rsaWrapper.encrypt(rsaWrapper.serverPub, message.toString());
    ws.send(encrypted);
}