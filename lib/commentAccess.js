const { readFileSync, writeFileSync } = require('fs');
const DATA_STORE = './data/comments.json';

const readData = () => JSON.parse(readFileSync(DATA_STORE, 'utf8') || '[]');

const read = function() {
  const data = readData();

  if (data.length === 0) {
    return 'NO COMMENTS TO SHOW';
  }

  const commentString = data
    .map(entry => {
      const comment = entry.comment
        .replace(/ /g, '&nbsp;')
        .replace(/\r\n/g, '<br>');

      return `<tr>
      <td class="date">${entry.date}</td>
      <td class="time">${entry.time}</td>
      <td class="name">${entry.name}</td>
      <td class="comment">${comment}</td>
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

  writeFileSync(DATA_STORE, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { read, writeEntry };
