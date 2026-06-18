document.addEventListener('DOMContentLoaded', function () {
    setupMissingImages();
    setupMobileMenu();
    setupHeroSlider();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
});


function setupMissingImages() {
    document.addEventListener('error', function (event) {
        var image = event.target;

        if (!image || image.tagName !== 'IMG') {
            return;
        }

        var frame = image.closest('.poster-frame, .hero-slide, .detail-backdrop');

        if (frame) {
            frame.classList.add('missing-image');
        }

        image.remove();
    }, true);
}

function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot') || 0));
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function setupLocalFilters() {
    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));

    filterBlocks.forEach(function (block) {
        var section = block.closest('section') || document;
        var input = block.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(block.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
        var count = section.querySelector('[data-filter-count]');

        function update() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var activeFilters = selects.map(function (select) {
                return {
                    key: select.getAttribute('data-filter-select'),
                    value: select.value
                };
            }).filter(function (item) {
                return item.value;
            });
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchFilters = activeFilters.every(function (filter) {
                    return (card.getAttribute('data-' + filter.key) || '') === filter.value;
                });
                var shouldShow = matchKeyword && matchFilters;

                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '共 ' + visible + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', update);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', update);
        });
    });
}

function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page || !window.MOVIE_DATA) {
        return;
    }

    var form = page.querySelector('form');
    var input = page.querySelector('[data-search-page-input]');
    var count = page.querySelector('[data-search-page-count]');
    var results = page.querySelector('[data-search-page-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    input.value = initialQuery;

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function cardTemplate(movie) {
        var cover = movie.cover || '1.jpg';
        return [
            '<article class="movie-card">',
            '    <a class="movie-poster-link" href="' + movie.url + '">',
            '        <div class="poster-frame" data-cover-title="' + escapeHtml(movie.title) + '">',
            '            <img src="' + cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        </div>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.one_line) + '</p>',
            '        <div class="tag-list"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function search() {
        var query = input.value.trim().toLowerCase();
        var list = window.MOVIE_DATA.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line].join(' ').toLowerCase();
            return !query || text.indexOf(query) !== -1;
        }).slice(0, 120);

        results.innerHTML = list.map(cardTemplate).join('');
        count.textContent = '找到 ' + list.length + ' 部影片' + (query ? '，关键词：' + input.value.trim() : '，显示推荐结果');
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set('q', input.value.trim());
        window.history.replaceState({}, '', url.toString());
        search();
    });

    input.addEventListener('input', search);
    search();
}

function setupPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            var player = button.closest('[data-player]');
            var video = player ? player.querySelector('video') : null;
            var source = player ? player.getAttribute('data-m3u8') : '';

            if (!video || !source) {
                return;
            }

            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');

            if (window.Hls && window.Hls.isSupported()) {
                if (video.__hlsInstance) {
                    video.__hlsInstance.destroy();
                }

                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                video.__hlsInstance = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        });
    });
}
