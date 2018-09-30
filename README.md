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

Encryption is done with RSA but the keys are patched along with the code.

## TODO

- RSA encryption
   - Generate keys on the fly and store in some other folder (/tmp for now).
- Keep dynamic port (Currently hard-coded at 7777)
- Use a logging framework in the server to log client request
- Divide modules into smaller components.
   - Client can have a message parser also
- Resolve the ugly nested if statements inside the client websocket connnect loop
