const rsaWrapper = require('./components/rsa-wrapper');

// generate opened and closed keys for client and server
rsaWrapper.generate('server');
rsaWrapper.generate('client');

console.log(`Keys generated ...`);