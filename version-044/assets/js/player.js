(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function attach(video, src) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }
  }

  window.MoviePlayer = {
    init: function (config) {
      ready(function () {
        var video = document.querySelector(config.video);
        var cover = document.querySelector(config.cover);
        var trigger = document.querySelector(config.trigger);
        if (!video || !config.src) {
          return;
        }
        attach(video, config.src);

        function play() {
          attach(video, config.src);
          video.setAttribute('controls', 'controls');
          if (cover) {
            cover.classList.add('is-hidden');
          }
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              if (cover) {
                cover.classList.remove('is-hidden');
              }
            });
          }
        }

        if (trigger) {
          trigger.addEventListener('click', play);
        }
        if (cover && cover !== trigger) {
          cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (cover && video.currentTime === 0) {
            cover.classList.remove('is-hidden');
          }
        });
      });
    }
  };
})();
