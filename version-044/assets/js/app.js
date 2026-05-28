(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    $all('form.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = './search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function yearMatches(value, option) {
    if (!option || option === '全部年份') {
      return true;
    }
    var year = parseInt(value, 10);
    if (option === '2010-2019') {
      return year >= 2010 && year <= 2019;
    }
    if (option === '2000-2009') {
      return year >= 2000 && year <= 2009;
    }
    if (option === '更早') {
      return year > 0 && year < 2000;
    }
    return String(value).indexOf(option) !== -1;
  }

  function typeMatches(value, option) {
    if (!option || option === '全部类型') {
      return true;
    }
    return String(value).indexOf(option) !== -1;
  }

  function initCatalog() {
    var grid = $('[data-catalog-grid]');
    if (!grid) {
      return;
    }
    var input = $('[data-catalog-search]');
    var yearSelect = $('[data-filter-year]');
    var typeSelect = $('[data-filter-type]');
    var empty = $('[data-catalog-empty]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '全部年份';
      var type = typeSelect ? typeSelect.value : '全部类型';
      var visible = 0;
      $all('.movie-item', grid).forEach(function (item) {
        var haystack = [
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.genre,
          item.dataset.year,
          item.dataset.keywords,
          item.textContent
        ].join(' ').toLowerCase();
        var okText = !text || haystack.indexOf(text) !== -1;
        var okYear = yearMatches(item.dataset.year || '', year);
        var okType = typeMatches(item.dataset.type || '', type);
        var ok = okText && okYear && okType;
        item.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initHero() {
    var root = $('[data-hero]');
    if (!root) {
      return;
    }
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initCatalog();
    initHero();
  });
})();
