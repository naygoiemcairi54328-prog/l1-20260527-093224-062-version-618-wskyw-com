(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var index = 0;
    var activate = function (next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) {
        dots[index].classList.remove('is-active');
      }
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });
    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  var searchBox = document.querySelector('[data-search-input]');
  if (searchBox) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var currentYear = 'all';
    var applyFilter = function () {
      var query = searchBox.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var year = card.getAttribute('data-year');
        var matchedText = !query || haystack.indexOf(query) !== -1;
        var matchedYear = currentYear === 'all' || year === currentYear;
        card.classList.toggle('hidden-by-search', !(matchedText && matchedYear));
      });
    };
    searchBox.addEventListener('input', applyFilter);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        currentYear = chip.getAttribute('data-filter-chip');
        applyFilter();
      });
    });
  }
})();
