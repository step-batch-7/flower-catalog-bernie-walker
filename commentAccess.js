const { readFileSync, writeFileSync } = require('fs');

const readData = () => JSON.parse(readFileSync('./lib/comments.json', 'utf8'));

const read = function() {
  const data = readData();

  if (data.length === 0) {
    return 'no comments to display';
  }

  const commentString = data
    .map(entry => `<p>${entry.date} ${entry.name} ${entry.comment}</p>`)
    .join('\n');

  return commentString;
};

const writeEntry = function(entry) {
  const data = readData();
  const date = new Date().toUTCString();
  const [name, comment] = entry
    .split('&')
    .map(field => field.split('=')[1].replace(/\+/g, ' '));

  data.unshift({ date, name, comment });

  writeFileSync('./lib/comments.json', JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { read, writeEntry };
