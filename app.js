const { readFileSync, statSync } = require('fs');
const { Response } = require('./lib/response');
const accessComments = require('./commentAccess');
const CONTENT_TYPES = require('./lib/mimeTypes');

const loadGuestBook = function(response) {
  const pageTemplate = readFileSync('./templates/guestBook.html', 'utf8').split(
    '__comment-section__'
  );
  const comments = accessComments.read();
  const content = pageTemplate
    .concat(pageTemplate.splice(1, 1, comments))
    .join('\n');

  response.updateResponse(200);
  response.addBody(content);
  response.updateHeader('Content-Length', content.length + 1);
  response.updateHeader('Content-type', CONTENT_TYPES['html']);
};

const postDetails = function(request, response) {
  accessComments.writeEntry(request.body);
  loadGuestBook(response);
};

const getLastModified = filePath => {
  const date = statSync(filePath).mtime;
  return new Date(date).toUTCString();
};

const getResource = function(request, response) {
  let { fileName, extension } = request.getResourceDetails();
  const nonTextExt = ['pdf', 'gif', 'jpg'];
  const filePath = `./public${fileName}`;

  if (fileName === '/guest-book') {
    loadGuestBook(response);
    return;
  }

  try {
    const lastModified = getLastModified(filePath);
    let content;

    if (request.isFileModified(lastModified)) {
      response.updateResponse(304);
      return;
    }

    if (nonTextExt.includes(extension)) {
      content = readFileSync(filePath);
    } else {
      content = readFileSync(filePath, 'utf8');
    }

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
  const fileHandlerLookup = { GET: getResource, POST: postDetails };
  const response = new Response(new Date().toUTCString());
  const fileHandler = fileHandlerLookup[request.command];

  response.updateResponse(402);

  if (fileHandler) {
    fileHandler(request, response);
  }

  response.writeTo(socket);
};

module.exports = { generateResponse };
