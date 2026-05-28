let HlsClass = window.Hls || null;
let hlsModulePromise = null;

const getHlsClass = async () => {
  if (HlsClass) {
    return HlsClass;
  }

  if (!hlsModulePromise) {
    hlsModulePromise = import('./hls.js').then((module) => module.H);
  }

  HlsClass = await hlsModulePromise;
  return HlsClass;
};

const attachStream = async (video, source) => {
  if (!video || !source || video.dataset.ready === 'true') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';
    return;
  }

  const Hls = await getHlsClass();

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    video.hlsInstance = hls;
    video.dataset.ready = 'true';
    return;
  }

  video.src = source;
  video.dataset.ready = 'true';
};

document.querySelectorAll('.player-shell').forEach((shell) => {
  const video = shell.querySelector('video');
  const overlay = shell.querySelector('.play-overlay');
  const source = shell.dataset.stream;

  const startPlayback = async () => {
    await attachStream(video, source);
    shell.classList.add('playing');

    try {
      await video.play();
    } catch (error) {
      shell.classList.remove('playing');
    }
  };

  overlay?.addEventListener('click', startPlayback);

  video?.addEventListener('play', () => {
    shell.classList.add('playing');
  });

  video?.addEventListener('pause', () => {
    if (!video.ended) {
      shell.classList.remove('playing');
    }
  });

  video?.addEventListener('ended', () => {
    shell.classList.remove('playing');
  });
});
