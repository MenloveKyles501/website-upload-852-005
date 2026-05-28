(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var query = panel.querySelector("[data-card-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var genre = panel.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && query) {
      query.value = q;
    }

    function includesText(card, keyword) {
      if (!keyword) {
        return true;
      }
      return card.textContent.toLowerCase().indexOf(keyword) !== -1;
    }

    function matchSelect(card, selector, value) {
      if (!value) {
        return true;
      }
      var dataValue = card.getAttribute(selector) || "";
      return dataValue.indexOf(value) !== -1;
    }

    function filter() {
      var keyword = query ? query.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var genreValue = genre ? genre.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matched = includesText(card, keyword) &&
          matchSelect(card, "data-year", yearValue) &&
          matchSelect(card, "data-region", regionValue) &&
          matchSelect(card, "data-genre", genreValue);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [query, year, region, genre].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", filter);
      control.addEventListener("change", filter);
    });

    filter();
  }

  function setupPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var button = player.querySelector(".player-start");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src");
      var started = false;

      function bindSource() {
        if (!source || started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else {
          video.src = source;
        }
      }

      function play() {
        bindSource();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      player.addEventListener("click", function (event) {
        if (!started && event.target !== video) {
          play();
        }
      });
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("is-visible", window.scrollY > 500);
    }
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
  }

  ready(function () {
    setupGlobalSearch();
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupBackTop();
  });
})();
