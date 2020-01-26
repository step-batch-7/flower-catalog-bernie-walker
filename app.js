const { readFileSync, statSync } = require('fs');
const { Response } = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const getResource = function(request, response) {
  let { fileName, extension } = request.getResourceDetails();
  const nonTextExt = ['pdf', 'gif', 'jpg'];
  const pubPath = './public';
  let encoding = 'utf8';

  if (fileName === '/') {
    fileName = '/index.html';
    extension = 'html';
  }

  if (nonTextExt.includes(extension)) {
    encoding = '';
  }

  try {
    const content = readFileSync(`${pubPath}${fileName}`, encoding);
    response.updateResponse(200);
    response.addBody(content);
    response.updateHeader('Content-Length', content.length + 1);
    response.updateHeader('Content-type', CONTENT_TYPES[extension]);
  } catch (error) {
    response.updateResponse(404);
  }
};

const generateResponse = function(request, socket) {
  const fileHandlerLookup = { GET: getResource };
  const response = new Response(new Date().toUTCString());
  const fileHandler = fileHandlerLookup[request.command];

  response.updateResponse(402);

  if (fileHandler) {
    fileHandler(request, response);
  }

  response.writeTo(socket);
};

module.exports = { generateResponse };