const { readFileSync, statSync } = require('fs');
const { Response } = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const getLastModified = filePath => {
  const date = statSync(filePath).mtime;
  return new Date(date).toUTCString();
};

const getResource = function(request, response) {
  let { fileName, extension } = request.getResourceDetails();
  const nonTextExt = ['pdf', 'gif', 'jpg'];
  let encoding = 'utf8';

  if (fileName === '/') {
    fileName = '/index.html';
    extension = 'html';
  }

  if (nonTextExt.includes(extension)) {
    encoding = '';
  }

  const filePath = `./public/${fileName}`;
  try {
    const lastModified = getLastModified(filePath);

    if (request.isFileModified(lastModified)) {
      response.updateResponse(304);
      return;
    }

    const content = readFileSync(filePath, encoding);
    response.updateResponse(200);
    response.addBody(content);
    response.updateHeader('Content-Length', content.length + 1);
    response.updateHeader('Content-type', CONTENT_TYPES[extension]);
    response.updateHeader('Last-Modified', lastModified);
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
