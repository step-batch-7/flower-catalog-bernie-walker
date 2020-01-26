const parseHeaders = function(headers) {
  return headers.reduce((container, element) => {
    const [key, value] = element.split(': ');
    container[key] = value;
    return container;
  }, {});
};

const setExtension = function(url) {
  const ext = url.match(/.*\.(.*)$/);

  if (ext) {
    return ext[1];
  }

  return '';
};

class Request {
  #command;
  #resource;
  #headers;
  #body;
  #extension;

  constructor(command, resource, headers, body) {
    this.#command = command;
    this.#resource = resource;
    this.#headers = headers;
    this.#body = body;
    this.#extension = setExtension(resource);
  }

  get command() {
    return this.#command;
  }

  getResourceDetails() {
    const fileName = this.#resource;
    const extension = this.#extension;
    return { fileName, extension };
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
