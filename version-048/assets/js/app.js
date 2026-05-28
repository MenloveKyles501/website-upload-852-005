(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        if (timer) {
          window.clearInterval(timer);
        }
        startHero();
      });
    });
    showSlide(0);
    startHero();
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  forms.forEach(function (form) {
    var scope = form.closest('section') || document;
    var input = form.querySelector('[data-search-input]');
    var region = form.querySelector('[data-region-filter]');
    var year = form.querySelector('[data-year-filter]');
    var clear = form.querySelector('[data-clear-filters]');
    if (!scope.querySelector('.movie-card')) {
      scope = document.querySelector('main') || document;
    }
    var noResults = form.parentElement ? form.parentElement.querySelector('[data-no-results]') : scope.querySelector('[data-no-results]');
    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var show = matchesKeyword && matchesRegion && matchesYear;
        card.classList.toggle('is-filtered-out', !show);
        if (show) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }
    [input, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', filterCards);
        el.addEventListener('change', filterCards);
      }
    });
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (year) {
          year.value = '';
        }
        filterCards();
      });
    }
  });
})();
