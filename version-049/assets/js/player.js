import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupPlayer(shell) {
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.play-overlay');
  var source = shell.getAttribute('data-video-src');
  var loaded = false;
  var hls = null;

  if (!video || !source) return;

  function loadSource() {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    loadSource();
    if (overlay) overlay.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (overlay) overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) play();
  });
  video.addEventListener('play', function () {
    if (overlay) overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.currentTime && overlay) overlay.classList.remove('is-hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hls) hls.destroy();
  });
}

ready(function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
});
