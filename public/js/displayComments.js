const main = function() {
  const displaySection = document.querySelector('.display-section');
  let displayMessage;

  if (comments.length === 0) {
    displaySection.innerText = 'no comments to display';
    return;
  }
  displayMessage = comments
    .map(entry => `<p>${entry.date} ${entry.name} ${entry.comment}</p>`)
    .join('\n');

  displaySection.innerHTML = displayMessage;
};

window.onload = main;
