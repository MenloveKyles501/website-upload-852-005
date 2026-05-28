(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        const toggle = document.querySelector('[data-menu-toggle]');
        const nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
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
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSimpleSearch() {
        document.querySelectorAll('[data-card-search]').forEach(function (input) {
            const targetSelector = input.getAttribute('data-target');
            const cards = Array.from(document.querySelectorAll(targetSelector));
            input.addEventListener('input', function () {
                const keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    const text = card.textContent.toLowerCase() + ' ' + Array.from(card.attributes).map(function (attr) {
                        return attr.value.toLowerCase();
                    }).join(' ');
                    card.classList.toggle('is-hidden', keyword && !text.includes(keyword));
                });
            });
        });
    }

    function setupAdvancedFilter() {
        const toolbar = document.querySelector('[data-advanced-filter]');
        const grid = document.querySelector('[data-all-movies]');
        if (!toolbar || !grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const keywordInput = toolbar.querySelector('[data-filter-keyword]');
        const categorySelect = toolbar.querySelector('[data-filter-category]');
        const yearSelect = toolbar.querySelector('[data-filter-year]');
        const resetButton = toolbar.querySelector('[data-filter-reset]');
        const countNode = toolbar.querySelector('[data-filter-count]');
        const years = Array.from(new Set(cards.map(function (card) {
            return card.getAttribute('data-year') || '';
        }).filter(Boolean))).sort().reverse();

        years.forEach(function (year) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        function apply() {
            const keyword = (keywordInput.value || '').trim().toLowerCase();
            const category = categorySelect.value;
            const year = yearSelect.value;
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = card.textContent.toLowerCase() + ' ' + Array.from(card.attributes).map(function (attr) {
                    return attr.value.toLowerCase();
                }).join(' ');
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchCategory = !category || card.getAttribute('data-category') === category;
                const matchYear = !year || card.getAttribute('data-year') === year;
                const isVisible = matchKeyword && matchCategory && matchYear;
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [keywordInput, categorySelect, yearSelect].forEach(function (node) {
            node.addEventListener('input', apply);
            node.addEventListener('change', apply);
        });

        resetButton.addEventListener('click', function () {
            keywordInput.value = '';
            categorySelect.value = '';
            yearSelect.value = '';
            apply();
        });

        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSimpleSearch();
        setupAdvancedFilter();
    });
})();
