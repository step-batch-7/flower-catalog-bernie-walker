const { Server } = require('net');
const { Request } = require('./lib/request');
const { getResponse } = require('./app');

const handleRequest = function(socket) {
  console.log(`connected to ${socket.remoteAddress} at ${socket.remotePort}`);

  socket.setEncoding('utf8');

  socket.on('data', req => {
    const message = getResponse(Request.from(req));

    socket.write(message);
  });

  socket.on('close', () => {
    console.log(`socket ${socket.remoteAddress} closed`);
  });
};

const main = function() {
  const server = new Server();

  server.on('connection', handleRequest);

  server.listen(9999, () => {
    console.log('Server started at', server.address());
  });
};

main();
