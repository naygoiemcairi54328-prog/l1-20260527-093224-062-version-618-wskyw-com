(function () {
  window.initializePlayer = function (source) {
    var stage = document.querySelector('.video-stage');
    var video = document.querySelector('[data-video-player]');
    var layer = document.querySelector('.play-layer');
    var button = document.querySelector('.play-button');
    if (!stage || !video || !source) {
      return;
    }

    var hlsObject = null;
    var ready = false;

    var attach = function () {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsObject = new window.Hls();
        hlsObject.loadSource(source);
        hlsObject.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var start = function () {
      attach();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    stage.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        video.pause();
        return;
      }
      start();
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsObject) {
        hlsObject.destroy();
      }
    });
  };
})();
