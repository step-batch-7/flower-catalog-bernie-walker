const { readFileSync, writeFileSync } = require('fs');

const readData = () => JSON.parse(readFileSync('./comments.json', 'utf8'));

const read = function() {
  const data = readData();

  if (data.length === 0) {
    return 'NO COMMENTS TO SHOW';
  }

  const commentString = data
    .map(entry => {
      return `<tr>
      <td class="date">${entry.date}</td>
      <td class="time">${entry.time}</td>
      <td class="name">${entry.name}</td>
      <td class="comment">${entry.comment}</td>
      </tr>`;
    })
    .join('\n');

  return commentString;
};

const writeEntry = function(entry) {
  const data = readData();
  const date = new Date().toUTCString().match(/(.*)\ \d{2}\:/)[1];
  const time = new Date().toLocaleTimeString();
  const [name, comment] = entry
    .split('&')
    .map(field => decodeURIComponent(field.split('=')[1].replace(/\+/g, ' ')));

  data.unshift({ date, time, name, comment });

  writeFileSync('./comments.json', JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { read, writeEntry };
