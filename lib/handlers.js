const { readFileSync, statSync } = require('fs');
const { App } = require('./app');
const accessComments = require('./commentAccess');
const CONTENT_TYPES = require('./mimeTypes');

const handleWrongMethod = function(request, response) {
  response.writeHead(422);
  response.end('Bad Request');
};

const handleWhenNoResource = function(request, response) {
  response.writeHead(404);
  response.end('404 Not found');
};

const parseUrl = function(url) {
  const fileName = url === '/' ? '/index.html' : url;
  const extension =
    fileName.match(/.*\.(.*)$/) && fileName.match(/.*\.(.*)$/)[1];

  return { fileName, extension };
};

const serveStatic = function(request, response, next) {
  const { fileName, extension } = parseUrl(request.url);
  const filePath = `./public${fileName}`;

  try {
    const content = readFileSync(filePath);
    response.setHeader('Content-type', CONTENT_TYPES[extension]);
    response.end(content);
  } catch (error) {
    next();
  }
};

const setLastModified = function(filePath, response, next) {
  try {
    const status = statSync(filePath);
    if (!status.isFile()) {
      throw 'directory';
    }
    const date = new Date(status.mtime).toUTCString();
    response.setHeader('Last-Modified', date);
  } catch (error) {
    next();
  }
};

const handleIfNotModified = function(request, response, next) {
  const { fileName } = parseUrl(request.url);
  const filePath = `./public${fileName}`;
  setLastModified(filePath, response, next);
  if (
    request.headers['if-modified-since'] === response.getHeader('Last-Modified')
  ) {
    response.writeHead(304);
    response.end();
    return;
  }
  next();
};

const getCommentContent = function() {
  const pageTemplate = readFileSync('./templates/guestBook.html', 'utf8').split(
    '__comment-section__'
  );
  const comments = accessComments.read();
  return pageTemplate.concat(pageTemplate.splice(1, 1, comments)).join('\n');
};

const loadGuestBook = function(request, response) {
  const content = getCommentContent();
  response.setHeader('Content-type', CONTENT_TYPES['html']);
  response.end(content);
};

const postDetails = function(request, response) {
  accessComments.writeEntry(request.body);
  response.writeHead(302, { location: request.url });
  response.end();
};

const recordBody = function(request, response, next) {
  let body = '';

  request.setEncoding('utf8');

  request.on('data', chunk => {
    body += chunk;
  });

  request.on('end', () => {
    request.body = body;
    next();
  });
};

const initiateApp = function() {
  const app = new App();

  app.use(recordBody);
  app.post('', postDetails);
  app.get('/guest-book.html$', loadGuestBook);
  app.get('', handleIfNotModified);
  app.get('', serveStatic);
  app.get('', handleWhenNoResource);
  app.use(handleWrongMethod);

  return app;
};

const generateResponse = function(request, response) {
  const app = initiateApp();
  app.serve(request, response);
};

module.exports = { generateResponse };
