(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function closeSearchBox(results) {
    if (results) {
      results.classList.remove("is-open");
      results.innerHTML = "";
    }
  }

  function setupNavigation() {
    var toggle = qs("[data-nav-toggle]");
    var nav = qs("[data-main-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = qs("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = qsa("[data-hero-slide]", carousel);
    var dots = qsa("[data-hero-dot]", carousel);
    var prev = qs("[data-hero-prev]", carousel);
    var next = qs("[data-hero-next]", carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot) {
        var dotIndex = Number(dot.getAttribute("data-hero-dot"));
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupGlobalSearch() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var inputs = qsa("[data-site-search]");

    inputs.forEach(function (input) {
      var box = input.parentElement ? qs("[data-search-results]", input.parentElement) : null;

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();

        if (!box || query.length < 1) {
          closeSearchBox(box);
          return;
        }

        var matches = data.filter(function (item) {
          return item.searchText.indexOf(query) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          box.innerHTML = '<div class="search-result-empty">没有找到相关影片</div>';
          box.classList.add("is-open");
          return;
        }

        box.innerHTML = matches.map(function (item) {
          return [
            '<a class="search-result-item" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + item.title + '海报" loading="lazy">',
            '<span>',
            '<strong>' + item.title + '</strong>',
            '<span>' + item.year + ' · ' + item.region + ' · ' + item.category + '</span>',
            '</span>',
            '</a>'
          ].join("");
        }).join("");
        box.classList.add("is-open");
      });

      document.addEventListener("click", function (event) {
        if (!input.parentElement || input.parentElement.contains(event.target)) {
          return;
        }
        closeSearchBox(box);
      });
    });
  }

  function setupLocalFilters() {
    qsa("[data-filter-scope]").forEach(function (scope) {
      var input = qs("[data-local-filter]", scope);
      var reset = qs("[data-filter-reset]", scope);
      var yearButtons = qsa("[data-filter-year]", scope);
      var termButtons = qsa("[data-filter-term]", scope);
      var activeYear = "";
      var activeTerm = "";

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var cards = qsa("[data-movie-card]", scope);

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();

          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !activeYear || (card.getAttribute("data-year") || "") === activeYear;
          var matchTerm = !activeTerm || text.indexOf(activeTerm.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchTerm));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (reset) {
        reset.addEventListener("click", function () {
          activeYear = "";
          activeTerm = "";
          if (input) {
            input.value = "";
          }
          qsa(".filter-buttons button", scope).forEach(function (button) {
            button.classList.remove("is-active");
          });
          reset.classList.add("is-active");
          applyFilter();
        });
        reset.classList.add("is-active");
      }

      yearButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeYear = button.getAttribute("data-filter-year") || "";
          yearButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          if (reset) {
            reset.classList.remove("is-active");
          }
          applyFilter();
        });
      });

      termButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeTerm = button.getAttribute("data-filter-term") || "";
          termButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          if (reset) {
            reset.classList.remove("is-active");
          }
          applyFilter();
        });
      });
    });
  }

  function setupPlayers() {
    qsa("[data-player]").forEach(function (frame) {
      var video = qs("video", frame);
      var button = qs("[data-play-button]", frame);
      var message = qs("[data-player-message]", frame);
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function startPlayer() {
        var src = video.getAttribute("data-video-src");

        if (!src) {
          setMessage("未找到播放源");
          return;
        }

        if (button) {
          button.classList.add("is-hidden");
        }

        setMessage("正在加载 HLS 播放源…");

        if (video.getAttribute("data-player-ready") === "true") {
          video.play().catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute("data-player-ready", "true");
            setMessage("播放源已就绪");
            video.play().catch(function () {
              setMessage("请点击视频控件开始播放。");
            });
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage("播放源加载失败，请稍后重试。");
              if (hlsInstance) {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.setAttribute("data-player-ready", "true");
          video.addEventListener("loadedmetadata", function () {
            setMessage("播放源已就绪");
            video.play().catch(function () {
              setMessage("请点击视频控件开始播放。");
            });
          }, { once: true });
        } else {
          setMessage("当前浏览器不支持 HLS 播放，请更换浏览器或启用 HLS.js。");
        }
      }

      if (button) {
        button.addEventListener("click", startPlayer);
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHeroCarousel();
    setupGlobalSearch();
    setupLocalFilters();
    setupPlayers();
  });
})();
