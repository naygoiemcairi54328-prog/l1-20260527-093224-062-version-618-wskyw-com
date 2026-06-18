(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        var target = "./category-all.html";
        window.location.href = value ? target + "?search=" + encodeURIComponent(value) : target;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var keywordInput = document.querySelector("[data-filter-keyword]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var empty = document.querySelector("[data-empty-result]");
    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get("search") || "";

    if (keywordInput && initialSearch) {
      keywordInput.value = initialSearch;
    }

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        card.classList.toggle("hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-layer");
      var stream = box.getAttribute("data-stream");
      var started = false;
      var instance = null;

      function loadAndPlay() {
        if (!video || !stream) {
          return;
        }
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            instance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            instance.loadSource(stream);
            instance.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.setAttribute("controls", "controls");
          if (button) {
            button.classList.add("is-hidden");
          }
        }
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            loadAndPlay();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("show", window.scrollY > 360);
    }
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
    setupBackTop();
  });
})();
