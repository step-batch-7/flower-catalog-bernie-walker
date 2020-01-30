const { readFileSync, statSync } = require('fs');
const accessComments = require('./commentAccess');
const CONTENT_TYPES = require('./mimeTypes');

const getCommentContent = () => {
  const pageTemplate = readFileSync('./templates/guestBook.html', 'utf8').split(
    '__comment-section__'
  );
  const comments = accessComments.read();
  return pageTemplate.concat(pageTemplate.splice(1, 1, comments)).join('\n');
};

const loadGuestBook = function(response) {
  const content = getCommentContent();
  response.setHeader('Content-type', CONTENT_TYPES['html']);
  response.end(content);
};

const postDetails = function(request, response) {
  accessComments.writeEntry(request.body);
  response.writeHead(302, { location: request.url });
  response.end();
};

const fileNotFound = response => {
  response.writeHead(404);
  response.end('404 Not found');
};

const getLastModified = (filePath, response) => {
  try {
    const status = statSync(filePath);
    if (!status.isFile()) {
      throw 'directory';
    }
    const date = new Date(status.mtime).toUTCString();
    response.setHeader('Last-Modified', date);
  } catch (error) {
    fileNotFound(response);
  }
};

const parseUrl = url => {
  const fileName = url === '/' ? '/index.html' : url;
  const extension =
    fileName.match(/.*\.(.*)$/) && fileName.match(/.*\.(.*)$/)[1];

  return { fileName, extension };
};

const getResource = function(request, response) {
  const { fileName, extension } = parseUrl(request.url);
  const filePath = `./public${fileName}`;

  if (fileName === '/guest-book.html') {
    loadGuestBook(response);
    return;
  }

  getLastModified(filePath, response);
  if (
    request.headers['if-modified-since'] === response.getHeader('Last-Modified')
  ) {
    response.writeHead(304);
    response.end();
    return;
  }

  const content = readFileSync(filePath);
  response.setHeader('Content-type', CONTENT_TYPES[extension]);
  response.end(content);
};

const wrongMethod = response => {
  response.writeHead(422);
  response.end('Bad Request');
};

const recordBody = request => {
  let body = '';

  request.setEncoding('utf8');

  request.on('data', chunk => {
    body += chunk;
  });

  request.on('end', () => {
    request.body = body;
    request.emit('bodyRecorded');
  });
};

const generateResponse = function(request, response) {
  request.on('bodyRecorded', () => {
    const fileHandlerLookup = { GET: getResource, POST: postDetails };
    const fileHandler = fileHandlerLookup[request.method] || wrongMethod;

    fileHandler(request, response);
  });

  recordBody(request);
};

module.exports = { generateResponse };
