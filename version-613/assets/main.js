(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-nav-links]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length) {
        var current = 0;
        var show = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5600);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
    var genreFilters = Array.prototype.slice.call(document.querySelectorAll('[data-genre-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var filterCards = function () {
        var keyword = searchInputs.map(function (input) {
            return input.value.trim().toLowerCase();
        }).filter(Boolean).join(' ');
        var year = yearFilters.map(function (select) {
            return select.value;
        }).filter(Boolean)[0] || '';
        var genre = genreFilters.map(function (select) {
            return select.value;
        }).filter(Boolean)[0] || '';
        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-region') || ''
            ].join(' ').toLowerCase();
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okYear = !year || (card.getAttribute('data-year') || '') === year;
            var okGenre = !genre || (card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
            card.classList.toggle('hidden-card', !(okKeyword && okYear && okGenre));
        });
    };
    searchInputs.concat(yearFilters).concat(genreFilters).forEach(function (field) {
        field.addEventListener('input', filterCards);
        field.addEventListener('change', filterCards);
    });
})();
