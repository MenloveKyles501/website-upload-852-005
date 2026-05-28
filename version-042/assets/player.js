import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(shell) {
    const video = shell.querySelector('video[data-src]');
    const trigger = shell.querySelector('[data-player-trigger]');
    if (!video) {
        return;
    }

    let attached = false;
    const source = video.getAttribute('data-src');

    function attachSource() {
        if (attached || !source) {
            return Promise.resolve();
        }
        attached = true;

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            shell.hlsInstance = hls;
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
            });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }

        return Promise.resolve();
    }

    async function playVideo() {
        await attachSource();
        try {
            await video.play();
            if (trigger) {
                trigger.classList.add('hidden');
            }
        } catch (error) {
            if (trigger) {
                trigger.classList.remove('hidden');
            }
            console.warn('Video playback was not started automatically.', error);
        }
    }

    if (trigger) {
        trigger.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (trigger) {
            trigger.classList.add('hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && trigger) {
            trigger.classList.remove('hidden');
        }
    });

    video.addEventListener('click', function () {
        if (!attached) {
            playVideo();
        }
    });
}

document.querySelectorAll('[data-player-shell]').forEach(setupPlayer);
