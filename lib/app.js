const { readFileSync, statSync } = require('fs');
const accessComments = require('./commentAccess');
const CONTENT_TYPES = require('./mimeTypes');

const loadGuestBook = function(response) {
  const pageTemplate = readFileSync('./templates/guestBook.html', 'utf8').split(
    '__comment-section__'
  );
  const comments = accessComments.read();
  const content = pageTemplate
    .concat(pageTemplate.splice(1, 1, comments))
    .join('\n');

  response.setHeader('Content-type', CONTENT_TYPES['html']);
  response.end(content);
};

const postDetails = function(request, response) {
  let body = '';

  request.setEncoding('utf8');

  request.on('data', chunk => {
    body += chunk;
  });

  request.on('end', () => {
    accessComments.writeEntry(body);
    loadGuestBook(response);
  });
};

const getLastModified = filePath => {
  const date = statSync(filePath).mtime;
  return new Date(date).toUTCString();
};

const getResource = function(request, response) {
  const fileName = request.url === '/' ? '/index.html' : request.url;
  const extension = fileName.match(/.*\.(.*)$/)[1];
  const encoding = ['pdf', 'gif', 'jpg'].includes(extension) ? '' : 'utf8';
  const filePath = `./public${fileName}`;

  if (fileName === '/guest-book.html') {
    loadGuestBook(response);
    return;
  }

  try {
    const lastModified = getLastModified(filePath);

    if (request.headers['If-Modified-Since'] === lastModified) {
      response.writeHead(304);
      response.end();
      return;
    }

    const content = readFileSync(filePath, encoding);

    response.setHeader('Content-type', CONTENT_TYPES[extension]);
    response.setHeader('Last-Modified', lastModified);
    response.end(content);
  } catch (error) {
    console.log(error);
    response.writeHead(404);
    response.end();
  }
};

const generateResponse = function(request, response) {
  const fileHandlerLookup = { GET: getResource, POST: postDetails };
  const fileHandler = fileHandlerLookup[request.method];

  if (fileHandler) {
    fileHandler(request, response);
    return;
  }

  response.writeHead(402);
  response.end();
};

module.exports = { generateResponse };
