(function () {
  window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;
    if (!video || !streamUrl) {
      return;
    }
    function attachStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.load();
    }
    function showOverlay(show) {
      if (overlay) {
        overlay.classList.toggle('is-hidden', !show);
      }
    }
    function startPlay() {
      attachStream();
      showOverlay(false);
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          showOverlay(true);
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });
    video.addEventListener('play', function () {
      showOverlay(false);
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        showOverlay(true);
      }
    });
    video.addEventListener('ended', function () {
      showOverlay(true);
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
    attachStream();
  };
})();
