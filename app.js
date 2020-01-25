const { readFileSync, statSync } = require('fs');
const { Response } = require('./lib/response');

const getResponse = function(request) {
  const response = new Response(new Date().toUTCString());

  response.updateResponse(402);

  return response.getMessage();
};

module.exports = { getResponse };
