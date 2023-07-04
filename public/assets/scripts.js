{
  document.body.classList.add('js');

  const comicSelector = document.getElementById('comics');
  comicSelector.addEventListener('change', function () {
    window.location.href = '/' + comicSelector.value;
  });
}
