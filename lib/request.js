const parseHeaders = function(headers) {
  return headers.reduce((container, element) => {
    const [key, value] = element.split(': ');
    container[key] = value;
    return container;
  }, {});
};

class Request {
  #command;
  #resource;
  #headers;
  #body;

  constructor(command, resource, headers, body) {
    this.#command = command;
    this.#resource = resource;
    this.#headers = headers;
    this.#body = body;
  }

  get command() {
    return this.#command;
  }

  get resource() {
    return this.#resource;
  }

  static from(userRequest) {
    const [top, body] = userRequest.split('\r\n\r\n');
    const head = top.split('\r\n');
    const requestLine = head[0];
    const [command, resource] = requestLine.split(' ');
    const headers = parseHeaders(head.slice(1));

    return new Request(command, resource, headers, body);
  }
}

module.exports = { Request };
