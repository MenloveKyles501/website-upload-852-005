(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
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
                timer = null;
            }
        }

        if (slides.length > 1) {
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
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            start();
        }
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-filter-empty]');
        var search = panel.querySelector('[data-filter-search]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : '';
        }

        function apply() {
            var q = valueOf(search);
            var r = valueOf(region);
            var t = valueOf(type);
            var y = valueOf(year);
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var ok = (!q || text.indexOf(q) !== -1) &&
                    (!r || (card.getAttribute('data-region') || '').toLowerCase() === r) &&
                    (!t || (card.getAttribute('data-type') || '').toLowerCase() === t) &&
                    (!y || (card.getAttribute('data-year') || '').toLowerCase() === y);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [search, region, type, year].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
    });

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card compact-card">',
            '<a href="' + escapeHtml(movie.url) + '" class="card-link">',
            '<div class="card-image"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></div>',
            '<div class="card-body">',
            '<h2>' + escapeHtml(movie.title) + '</h2>',
            '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>',
            '<p>' + escapeHtml(movie.description) + '</p>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.MOVIE_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var input = searchPage.querySelector('[data-search-input]');
        var typeSelect = searchPage.querySelector('[data-search-type]');
        var yearSelect = searchPage.querySelector('[data-search-year]');
        var results = searchPage.querySelector('[data-search-results]');
        var query = params.get('q') || '';

        if (input) {
            input.value = query;
        }

        function renderSearch() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var t = typeSelect ? typeSelect.value.trim().toLowerCase() : '';
            var y = yearSelect ? yearSelect.value.trim().toLowerCase() : '';
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.description, movie.category].join(' ').toLowerCase();
                return (!q || haystack.indexOf(q) !== -1) &&
                    (!t || String(movie.type).toLowerCase() === t) &&
                    (!y || String(movie.year).toLowerCase() === y);
            }).slice(0, 240);

            if (results) {
                results.innerHTML = matched.length ? matched.map(movieCard).join('') : '<p class="filter-empty show">没有匹配的影片</p>';
            }
        }

        [input, typeSelect, yearSelect].forEach(function (item) {
            if (item) {
                item.addEventListener('input', renderSearch);
                item.addEventListener('change', renderSearch);
            }
        });
        renderSearch();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var hlsInstance = null;

        function play() {
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-video');
            if (!source) {
                return;
            }
            if (button) {
                button.classList.add('hidden');
            }
            if (video.getAttribute('data-ready') !== 'true') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute('data-ready', 'true');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== 'true') {
                    play();
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
}());
