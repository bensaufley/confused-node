(function () {
  'use strict';

  var comicSelector = document.getElementById('comics');

  comicSelector.addEventListener('change', function () {
    window.location.href = '/' + comicSelector.value;
  });
})();
