const { readFileSync, writeFileSync } = require('fs');

const read = function() {
  const data = JSON.parse(readFileSync('./lib/comments.json', 'utf8'));
  const commentString = data.map(
    entry => `<p>${entry.date} ${entry.name} ${entry.comment}</p>`
  );

  return commentString;
};

module.exports = { read };
