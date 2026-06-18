(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    const searchInput = document.querySelector("[data-card-search]");
    const cardList = document.querySelector("[data-card-list]");
    const filterBox = document.querySelector("[data-filter-box]");
    let activeKind = "all";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyCardFilter() {
        if (!cardList) {
            return;
        }
        const query = normalize(searchInput ? searchInput.value : "");
        const cards = Array.from(cardList.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
            const text = normalize(card.getAttribute("data-query"));
            const kind = card.getAttribute("data-kind") || "";
            const matchQuery = !query || text.indexOf(query) !== -1;
            const matchKind = activeKind === "all" || kind === activeKind;
            card.classList.toggle("is-hidden", !(matchQuery && matchKind));
        });
    }

    if (searchInput && cardList) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");
        if (initialQuery) {
            searchInput.value = initialQuery;
        }
        searchInput.addEventListener("input", applyCardFilter);
    }

    if (filterBox) {
        filterBox.addEventListener("click", function (event) {
            const button = event.target.closest("[data-filter-kind]");
            if (!button) {
                return;
            }
            activeKind = button.getAttribute("data-filter-kind") || "all";
            filterBox.querySelectorAll("[data-filter-kind]").forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyCardFilter();
        });
    }

    applyCardFilter();
})();
