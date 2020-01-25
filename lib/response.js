const statusCodeLookup = {
  200: 'OK',
  404: 'Not Found',
  402: 'Unprocessable Request'
};

class Response {
  #response;
  #header;
  #body;

  constructor(date) {
    this.#response = 'HTTP/1.0 ';
    this.#header = {
      'Content-Length': 0,
      Date: date
    };
    this.#body = '';
  }

  updateResponse(code) {
    this.#response = `${this.#response} ${code} ${statusCodeLookup[code]}`;
  }

  updateHeader(key, value) {
    this.#header[key] = value;
  }

  addBody(content) {
    this.#body = content;
  }

  getMessage() {
    let head = Object.entries(this.#header);

    head = head.reduce(
      (headContainer, headLines) =>
        headContainer.concat([`${headLines[0]}: ${headLines[1]}`]),

      []
    );

    return (
      [this.#response]
        .concat(head)
        .concat(['', this.#body])
        .join('\r\n') + '\n'
    );
  }
}

module.exports = { Response };
