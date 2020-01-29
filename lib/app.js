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
  let body = '';

  request.setEncoding('utf8');

  request.on('data', chunk => {
    body += chunk;
  });

  request.on('end', () => {
    accessComments.writeEntry(body);
    response.writeHead(302, { location: request.url });
    response.end();
  });
};

const fileNotFound = response => {
  response.writeHead(404);
  response.end('404 Not found');
};

const getLastModified = filePath => {
  const date = statSync(filePath).mtime;
  return new Date(date).toUTCString();
};

const parseUrl = url => {
  const fileName = url === '/' ? '/index.html' : url;
  const extension =
    fileName.match(/.*\.(.*)$/) && fileName.match(/.*\.(.*)$/)[1];
  const encoding = ['pdf', 'gif', 'jpg'].includes(extension) ? '' : 'utf8';

  return { fileName, extension, encoding };
};

const getResource = function(request, response) {
  const { fileName, extension, encoding } = parseUrl(request.url);
  const filePath = `./public${fileName}`;

  if (fileName === '/guest-book.html') {
    loadGuestBook(response);
    return;
  }

  try {
    const lastModified = getLastModified(filePath);

    if (request.headers['if-modified-since'] === lastModified) {
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
    fileNotFound(response);
  }
};

const recordBody = request => {};

const wrongMethod = (request, response) => {
  response.writeHead(422);
  response.end('Bad Request');
};

const generateResponse = function(request, response) {
  const fileHandlerLookup = { GET: getResource, POST: postDetails };
  const fileHandler = fileHandlerLookup[request.method] || wrongMethod;

  fileHandler(request, response);
};

module.exports = { generateResponse };
