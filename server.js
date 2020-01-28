const { Server } = require('http');
const { generateResponse } = require('./lib/app');

const main = function() {
  const server = new Server((request, response) => {
    const { socket } = request;
    console.log(`connected to ${socket.remoteAddress} at ${socket.remotePort}`);

    request.on('close', () => {
      console.log('REQUEST ENDED');
    });
    generateResponse(request, response);
  });

  server.listen(3000, () => {
    console.log('Server started at', server.address());
  });
};

main();
