const statusCodeLookup = {
  200: 'OK',
  304: 'Not Modified',
  404: 'Not Found',
  402: 'Unprocessable Request'
};

const generateHeadersText = function(header) {
  let head = Object.entries(header);

  head = head.reduce(
    (headContainer, headLines) =>
      headContainer.concat([`${headLines[0]}: ${headLines[1]}`]),

    []
  );

  return head.join('\r\n');
};

class Response {
  #response;
  #header;
  #body;

  constructor(date) {
    this.#response = '';
    this.#header = {
      'Content-Length': 0,
      Date: date
    };
    this.#body = '';
  }

  updateResponse(code) {
    this.#response = `HTTP/1.0  ${code} ${statusCodeLookup[code]}`;
  }

  updateHeader(key, value) {
    this.#header[key] = value;
  }

  addBody(content) {
    this.#body = content;
  }

  writeTo(writable) {
    writable.write(`${this.#response}\r\n`);
    writable.write(generateHeadersText(this.#header));
    writable.write('\r\n\r\n');
    this.#body && writable.write(this.#body);
    writable.write('\n');
  }
}

module.exports = { Response };
