
(function () {
  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

  function initMenu() {
    const toggle = qs('[data-menu-toggle]');
    const nav = qs('[data-site-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    const slides = qsa('[data-hero-slide]');
    const dots = qsa('[data-hero-dot]');
    const prev = qs('[data-hero-prev]');
    const next = qs('[data-hero-next]');
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    function render() {
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { index = i; render(); restart(); }));
    if (prev) prev.addEventListener('click', () => { go(-1); restart(); });
    if (next) next.addEventListener('click', () => { go(1); restart(); });

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => go(1), 6500);
    }

    render();
    restart();
  }

  function initFilters() {
    const input = qs('[data-filter-input]');
    const grid = qs('[data-filter-grid]');
    if (!input || !grid) return;
    const cards = qsa('.movie-card', grid);
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '没有匹配到结果';
    function filter() {
      const term = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const blob = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year, card.dataset.tags].join(' ');
        const ok = !term || blob.includes(term);
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (shown === 0) {
        if (!grid.contains(empty)) grid.appendChild(empty);
      } else if (grid.contains(empty)) {
        empty.remove();
      }
    }
    input.addEventListener('input', filter);
    filter();
  }

  function initPlayer() {
    const buttons = qsa('[data-play-video]');
    const video = qs('[data-player-video]');
    if (!buttons.length || !video) return;
    const shell = qs('[data-player-shell]');
    let hls = null;

    function stopCurrent() {
      try { video.pause(); } catch (e) {}
      if (hls) {
        try { hls.destroy(); } catch (e) {}
        hls = null;
      }
    }

    function playSrc(src) {
      if (!src) return;
      stopCurrent();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            try { hls.destroy(); } catch (e) {}
            hls = null;
          }
        });
        return;
      }
      video.src = src;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-play-src');
        playSrc(src);
        if (shell) shell.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeroSlider();
    initFilters();
    initPlayer();
  });
})();
