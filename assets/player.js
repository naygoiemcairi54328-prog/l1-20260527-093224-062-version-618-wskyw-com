function initializeMoviePlayer(streamUrl) {
    const video = document.getElementById("movie-video");
    const layer = document.getElementById("play-layer");
    let ready = false;

    if (!video || !layer || !streamUrl) {
        return;
    }

    function bindStream() {
        if (ready) {
            return;
        }
        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function startPlayback() {
        bindStream();
        layer.classList.add("hidden");
        video.controls = true;
        const playback = video.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {
                video.controls = true;
            });
        }
    }

    layer.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });
}
