const animateJug = function() {
  const jug = document.querySelector('.jug');

  jug.classList.add('hide');

  setTimeout(() => {
    jug.classList.remove('hide');
  }, 1000);
};
