#!/usr/bin/env node

const utils = require('./utils');

const WebSocket = require('ws');

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
            }
            if ( message )
                sendToServer(message.toString());
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
    const action = utils.getFirstWord(data);
    console.log('Action: ', action);
    const task = utils.getRestWords(data);
    console.log('Task: ', task);
    if ( action == 'connected' ) {
        console.log("Connected to the server ...");
        displayRegisterMessage();
    } else if ( action === 'registered' ) {
        console.log("Registration done");
        registered = true;
        displayInputFormatMessage();
    } else if ( action === 'notRegistered' ) {
        console.log("Not registered. Error: ", task);
    } else if ( action == 'message' ) {
        displayMessage(task);    
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

function decodeInput(input) {
    const action = utils.decodeAction(input);
    if ( action === 'message' ) {
        const formatedMessage = formatMessageToSend(username, input);
        if ( formatedMessage === 'invalid') {
            return 'invalid';
        }
        sendToServer(formatedMessage);
    } else if ( action === 'cmd') {

    } else {
        return 'invalid';
    }
}


function displayMessage(task) {
    const sender = utils.getFirstWord(task);
    const message = utils.getRestWords(task);
    console.log(`${sender} ---> ${message}`);
}

function displayInputFormatMessage() {
    console.log("======================================================");
    console.log("Format for input: ");
    console.log("To send a message to user_name, use: (without < and >)");
    console.log("message user_name <message>");
    console.log("To send a message to user_name, use:");
    console.log("run <command>");
    console.log("======================================================");
}

function displayRegisterMessage() {
    console.log("======================================================");
    console.log(" ]] Enter username to register on the server ");
}

function sendToServer(message) {
    console.log("Sending to server: ", message.toString());
    ws.send(message.toString());
}