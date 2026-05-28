(() => {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    const start = () => {
      timer = window.setInterval(() => showSlide(active + 1), 5200);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    prev?.addEventListener('click', () => {
      showSlide(active - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      showSlide(active + 1);
      restart();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        restart();
      });
    });

    start();
  }

  const normalize = (value) => String(value || '').toLowerCase().trim();

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const searchInput = scope.querySelector('[data-search-input]');
    const regionFilter = scope.querySelector('[data-region-filter]');
    const yearFilter = scope.querySelector('[data-year-filter]');
    const list = scope.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
    const emptyState = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    const applyFilters = () => {
      const query = normalize(searchInput?.value);
      const region = normalize(regionFilter?.value);
      const year = normalize(yearFilter?.value);
      let visible = 0;

      cards.forEach((card) => {
        const searchText = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year
        ].join(' '));
        const matchesQuery = !query || searchText.includes(query);
        const matchesRegion = !region || normalize(card.dataset.region).includes(region);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const shouldShow = matchesQuery && matchesRegion && matchesYear;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    };

    searchInput?.addEventListener('input', applyFilters);
    regionFilter?.addEventListener('change', applyFilters);
    yearFilter?.addEventListener('change', applyFilters);
  });
})();
