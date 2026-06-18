(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-site-menu]");
    var search = document.querySelector(".header-search");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
        if (search) {
          search.classList.toggle("open");
        }
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("active", pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("active", pos === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var list = document.querySelector("[data-search-list]");
    var input = document.querySelector("[data-page-search]");
    var empty = document.querySelector("[data-empty-state]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

    function applyFilter() {
      if (!list) {
        return;
      }
      var q = normalize(input ? input.value : "");
      var activeButton = document.querySelector("[data-filter].active");
      var filter = activeButton ? normalize(activeButton.getAttribute("data-filter")) : "all";
      var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var visible = 0;

      items.forEach(function (item) {
        var text = normalize(item.getAttribute("data-keywords"));
        var okSearch = !q || text.indexOf(q) !== -1;
        var okFilter = filter === "all" || text.indexOf(filter) !== -1;
        var show = okSearch && okFilter;
        item.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", applyFilter);
      applyFilter();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        applyFilter();
      });
    });
  });

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var cover = document.querySelector("[data-player-cover]");
      var button = document.querySelector("[data-player-button]");
      var loaded = false;

      if (!video || !streamUrl) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        attach();
        if (cover) {
          cover.classList.add("hidden");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            if (cover) {
              cover.classList.remove("hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      video.addEventListener("playing", function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      });
    });
  };
})();
