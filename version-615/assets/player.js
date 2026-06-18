function startMoviePlayer(source) {
  var holder = document.querySelector("[data-player]");
  if (!holder) {
    return;
  }
  var video = holder.querySelector("video");
  var layer = holder.querySelector("[data-play-layer]");
  var booted = false;

  function boot() {
    if (!video || !source) {
      return;
    }
    if (!booted) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
      booted = true;
    }
    if (layer) {
      layer.hidden = true;
    }
    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener("click", boot);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!booted || video.paused) {
        boot();
      }
    });
  }
}
