const request = require('supertest');
const sandbox = require('sinon').createSandbox();
const fs = require('fs');
const { generateResponse } = require('../lib/handlers.js');

describe('GET /guest-book', function() {
  let fakeReader;
  before(function() {
    fakeReader = sandbox.stub(fs, 'readFileSync');
    fakeReader.returns('[]');
  });

  after(function() {
    sandbox.restore;
  });

  it('should respond with the guest book', function(done) {
    request(generateResponse)
      .get('/guest-book.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '1101')
      .expect(/Guest Book/)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('should respond with not found', function(done) {
    request(generateResponse)
      .get('/guest-book.htmlabcd')
      .expect(404)
      .expect('404 Not found')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('should respond with the guest book when data base is empty', function(done) {
    fakeReader.returns('');
    request(generateResponse)
      .get('/guest-book.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '1101')
      .expect(/Guest Book/)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('should respond with the guest book with comments', function(done) {
    fakeReader.returns(`[
      {
        "date": "12/12/12",
        "time": "12:12:12",
        "name": "bernie-walker",
        "comment": "hello world"
      }
    ]`);
    request(generateResponse)
      .get('/guest-book.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '1262')
      .expect(/bernie-walker/)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

describe('POST /guest-book.html', function() {
  let fakeWriter;
  before(function() {
    const fakeWriter = sandbox.stub(fs, 'writeFileSync');
  });

  after(function() {
    sandbox.restore;
  });

  it('should record and redirect page', function(done) {
    request(generateResponse)
      .post('/guest-book.html')
      .send('username=bernie&commentText=hello')
      .expect(302)
      .expect('Location', '/guest-book.html')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

describe('serveStatic', function() {
  context('GET /', function() {
    it('responds with index.html', function(done) {
      request(generateResponse)
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '984')
        .expect(/Flower Catalogue/)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          done();
        });
    });
  });

  context('GET /js/animateJug.js', function() {
    it('should respond with js file', function(done) {
      request(generateResponse)
        .get('/js/animateJug.js')
        .expect(200)
        .expect('Content-Type', 'application/javascript')
        .expect('Content-Length', '179')
        .expect(/animateJug/)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          done();
        });
    });
  });

  context('GET /css/styleFlower.css', function() {
    it('should respond with the style sheet', function(done) {
      request(generateResponse)
        .get('/css/stylesFlower.css')
        .expect(200)
        .expect('Content-Type', 'text/css')
        .expect('Content-Length', '631')
        .expect(/\.page-heading/)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          done();
        });
    });
  });

  context('GET /image/freshorigins.jpg', function() {
    it('should respond with the requested image', function(done) {
      request(generateResponse)
        .get('/image/freshorigins.jpg')
        .expect(200)
        .expect('Content-Type', 'image/jpg')
        .expect('Content-Length', '381314')
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          done();
        });
    });
  });
});

describe('handleWhenNoResponse', function() {
  it('should respond with file not found', function(done) {
    request(generateResponse)
      .get('/helloWorld')
      .expect(404)
      .expect('404 Not found')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('should respond with file not found when resource us directory', function(done) {
    request(generateResponse)
      .get('/../lib')
      .expect(404)
      .expect('404 Not found')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

describe('handleWrongMethod', function() {
  it('should respond with unprocessable entity', function(done) {
    request(generateResponse)
      .put('/helloWorld')
      .expect(422)
      .expect('Bad Request')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});
