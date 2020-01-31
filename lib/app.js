const matchRoute = function(route, req) {
  if (route.method) {
    const path = new RegExp(route.path);
    return req.method == route.method && req.url.match(path);
  }
  return true;
};

class App {
  #routes;

  constructor() {
    this.#routes = [];
  }

  get(path, handler) {
    this.#routes.push({ path, handler, method: 'GET' });
  }

  post(path, handler) {
    this.#routes.push({ path, handler, method: 'POST' });
  }

  use(middleware) {
    this.#routes.push({ handler: middleware });
  }

  serve(req, res) {
    const matchingHandlers = this.#routes.filter(route =>
      matchRoute(route, req)
    );

    const next = function(command) {
      const router = matchingHandlers.shift();
      router.handler(req, res, next);
    };

    next();
  }
}

module.exports = { App };
