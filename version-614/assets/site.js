(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
    }

    function setupHero() {
        var slider = document.getElementById("heroSlider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var next = slider.querySelector("[data-hero-next]");
        var prev = slider.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilter() {
        var input = document.querySelector(".js-filter-input");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
        var label = document.querySelector(".js-filter-count");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        function apply() {
            var q = text(input.value);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = text(card.getAttribute("data-search"));
                var visible = !q || haystack.indexOf(q) !== -1;
                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (label) {
                label.textContent = q ? "找到 " + shown + " 部相关影片" : "";
            }
        }

        if (initial) {
            input.value = initial;
        }
        input.addEventListener("input", apply);
        apply();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            existing.addEventListener("error", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.setAttribute("data-hls-loader", "1");
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function bindStream(box, callback) {
        var video = box.querySelector("video");
        var src = box.getAttribute("data-stream");
        if (!video || !src) {
            return;
        }
        if (box.getAttribute("data-ready") === "1") {
            callback();
            return;
        }
        if (box.getAttribute("data-loading") === "1") {
            box.addEventListener("streamready", callback, { once: true });
            return;
        }
        box.setAttribute("data-loading", "1");

        function finish() {
            box.removeAttribute("data-loading");
            box.setAttribute("data-ready", "1");
            box.dispatchEvent(new Event("streamready"));
            callback();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            finish();
        } else {
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                finish();
            });
        }
    }

    function startPlayer(box) {
        var video = box.querySelector("video");
        if (!video) {
            return;
        }
        bindStream(box, function () {
            box.classList.add("is-playing");
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    box.classList.remove("is-playing");
                });
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        if (players.length && !document.createElement("video").canPlayType("application/vnd.apple.mpegurl")) {
            loadHls(function () {});
        }
        players.forEach(function (box) {
            var overlay = box.querySelector(".player-overlay");
            var video = box.querySelector("video");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    startPlayer(box);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!box.getAttribute("data-ready") || video.paused) {
                        startPlayer(box);
                    }
                });
                video.addEventListener("play", function () {
                    box.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime < 0.2) {
                        box.classList.remove("is-playing");
                    }
                });
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilter();
        setupPlayers();
    });
})();
