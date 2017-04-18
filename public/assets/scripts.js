(function () {
  'use strict';

  document.body.classList.add('js');

  var comicSelector = document.getElementById('comics');

  comicSelector.addEventListener('change', function () {
    window.location.href = '/' + comicSelector.value;
  });
})();
