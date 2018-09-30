Application is very basic and implementation wise it support:
1. Client Login
2. Message other clients on the server
3. Running commands on the Server

# Installation

Use npm for installation of dependencies
`npm install`

# Starting Server

`node server.js`

# Starting Client

`node client.js`

# Client Commands

1. Register using a name
2. Following commands are allowed - 'message <user> <message>' and 'cmd <command>'

# WARNING

Encryption is not done for the messages being sent in socket connection.

## TODO

- Use RSA Encrption for sending messages
- Keep dynamic port (Currently hard-coded at 7777)
- Use a logging framework in the server to log client request
- Organize modules into components. Keep folders for client, server, utilities.
- Utilities for Server such as Message Parsing can be nested under the server folder (same for client)
