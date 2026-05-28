(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    if (!panel || !cards.length) return;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var genre = panel.querySelector('[data-filter-genre]');
    var reset = panel.querySelector('[data-filter-reset]');
    var count = panel.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && input) input.value = initialQuery;

    function matchCard(card) {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var g = normalize(genre && genre.value);
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardGenre = normalize(card.getAttribute('data-genre'));
      return (!q || haystack.indexOf(q) !== -1) &&
        (!y || cardYear === y) &&
        (!r || cardRegion === r) &&
        (!g || cardGenre.indexOf(g) !== -1);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var matched = matchCard(card);
        card.classList.toggle('is-hidden', !matched);
        if (matched) visible += 1;
      });
      if (count) count.textContent = visible + ' 部影片';
      var empty = document.querySelector('[data-empty-state]');
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    [input, year, region, genre].forEach(function (control) {
      if (control) control.addEventListener('input', apply);
      if (control) control.addEventListener('change', apply);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) input.value = '';
        if (year) year.value = '';
        if (region) region.value = '';
        if (genre) genre.value = '';
        apply();
      });
    }
    apply();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
