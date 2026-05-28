
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initNavToggle() {
    const btn = qs('[data-nav-toggle]');
    const panel = qs('[data-nav-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      panel.classList.toggle('hidden');
    });
  }

  function initSearchRedirect() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        const input = form.querySelector('input[name="q"]');
        const q = input ? input.value.trim() : '';
        if (!q) return;
        e.preventDefault();
        window.location.href = form.dataset.searchUrl + '?q=' + encodeURIComponent(q);
      });
    });
  }

  function createCard(item, basePath) {
    const a = document.createElement('a');
    a.className = 'movie-card block group overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100';
    a.href = basePath + item.slug + '.html';
    a.innerHTML =
      '<div class="relative overflow-hidden aspect-[3/4] bg-slate-100">' +
        '<img loading="lazy" src="' + basePath + '../assets/posters/' + String(item.id).padStart(4, '0') + '.svg" alt="' + escapeHtml(item.title) + '" class="movie-poster w-full h-full object-cover">' +
        '<div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-75 group-hover:opacity-85 transition-opacity"></div>' +
        '<div class="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">' + escapeHtml(item.region || '影视') + '</div>' +
        '<div class="absolute bottom-0 left-0 right-0 p-4 text-white">' +
          '<h3 class="text-lg font-bold leading-tight line-clamp-2 mb-1">' + escapeHtml(item.title) + '</h3>' +
          '<p class="text-xs text-white/82 line-clamp-2">' + escapeHtml(item.one_line || item.summary || '') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="p-4 space-y-2">' +
        '<div class="flex flex-wrap gap-2 text-[11px]">' +
          badge(item.type) + badge(String(item.year) + '年') +
        '</div>' +
        '<div class="text-sm text-slate-600 line-clamp-2">' + escapeHtml(item.genre || '') + '</div>' +
      '</div>';
    return a;
  }

  function badge(text) {
    return '<span class="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">' + escapeHtml(text) + '</span>';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"]+/g, function (m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root) return;
    const results = qs('[data-search-results]');
    const empty = qs('[data-search-empty]');
    const count = qs('[data-search-count]');
    const sortSel = qs('[data-search-sort]');
    const qInput = qs('[data-search-input]');
    const basePath = root.dataset.basePath || '../';

    fetch(root.dataset.indexJson)
      .then(r => r.json())
      .then(function (data) {
        const params = new URLSearchParams(location.search);
        const initialQ = (params.get('q') || '').trim();
        if (qInput) qInput.value = initialQ;

        function rank(list, q, sort) {
          const qq = q.toLowerCase();
          let filtered = list.filter(function (item) {
            const hay = [item.title, item.region, item.type, item.genre, item.tags, item.one_line, item.summary].join(' ').toLowerCase();
            return !qq || hay.indexOf(qq) !== -1;
          });
          if (sort === 'year') {
            filtered.sort((a,b) => (b.year - a.year) || (b.id - a.id));
          } else if (sort === 'title') {
            filtered.sort((a,b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
          } else {
            filtered.sort((a,b) => (b.score - a.score) || (a.id - b.id));
          }
          return filtered;
        }

        function render() {
          const q = (qInput ? qInput.value : '').trim();
          const sort = sortSel ? sortSel.value : 'score';
          const list = rank(data, q, sort).slice(0, 240);
          results.innerHTML = '';
          list.forEach(function (item) { results.appendChild(createCard(item, basePath)); });
          if (count) count.textContent = String(list.length);
          if (empty) empty.classList.toggle('hidden', list.length > 0);
        }
        if (qInput) qInput.addEventListener('input', render);
        if (sortSel) sortSel.addEventListener('change', render);
        render();
      });
  }

  function loadHlsAndPlay(video, src) {
    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {});
        hls.on(window.Hls.Events.ERROR, function (evt, data) {
          if (data && data.fatal) {
            console.error('HLS error', data);
          }
        });
        video._hls = hls;
        return;
      }
      video.src = src;
    }

    if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
      attach();
    } else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      s.async = true;
      s.onload = attach;
      document.head.appendChild(s);
    }
  }

  function initPlayer() {
    const shell = qs('[data-player-shell]');
    if (!shell) return;
    const video = qs('video', shell);
    const src = shell.dataset.src;
    const playBtn = qs('[data-play-btn]', shell);
    const loading = qs('[data-loading]', shell);
    if (!video || !src) return;

    function setLoading(show) {
      if (loading) loading.classList.toggle('hidden', !show);
    }

    setLoading(true);
    loadHlsAndPlay(video, src);
    video.addEventListener('loadedmetadata', function () { setLoading(false); });
    video.addEventListener('canplay', function () { setLoading(false); });
    video.addEventListener('error', function () { setLoading(false); });

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        video.play().catch(function () {});
      });
    }
  }

  function initHeroShuffle() {
    const hero = qs('[data-hero-random]');
    if (!hero) return;
    const items = qsa('[data-hero-item]');
    if (items.length < 2) return;
    let idx = 0;
    setInterval(function () {
      items.forEach(function (item, i) { item.classList.toggle('hidden', i !== idx); });
      idx = (idx + 1) % items.length;
    }, 5000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavToggle();
    initSearchRedirect();
    initSearchPage();
    initPlayer();
    initHeroShuffle();
  });
})();
