(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    start();
  }

  function initPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-play]");
      if (!video || !button) {
        return;
      }
      var stream = button.getAttribute("data-stream");

      function attach() {
        if (!stream) {
          return;
        }
        if (frame.getAttribute("data-ready") !== "true") {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          frame.setAttribute("data-ready", "true");
        }
        frame.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        attach();
      });

      frame.addEventListener("click", function (event) {
        if (event.target === frame) {
          attach();
        }
      });
    });
  }

  function uniqueValues(items, key) {
    var set = {};
    items.forEach(function (item) {
      var value = item[key];
      if (value) {
        set[value] = true;
      }
    });
    return Object.keys(set).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.url) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
          "<div class=\"movie-meta-line\">" +
            "<a href=\"./category-" + escapeHtml(movie.categorySlug) + ".html\">" + escapeHtml(movie.categoryName) + "</a>" +
            "<span>" + escapeHtml(movie.region) + "</span>" +
            "<span>" + escapeHtml(movie.type) + "</span>" +
          "</div>" +
          "<h3><a href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.intro) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  function initSearch() {
    var results = document.getElementById("searchResults");
    var form = document.querySelector("[data-search-form]");
    if (!results || !form || !window.MovieSearchIndex) {
      return;
    }
    var data = window.MovieSearchIndex;
    var input = document.getElementById("searchInput");
    var typeFilter = document.getElementById("typeFilter");
    var regionFilter = document.getElementById("regionFilter");
    var yearFilter = document.getElementById("yearFilter");
    var title = document.getElementById("searchTitle");
    var params = new URLSearchParams(window.location.search);

    fillSelect(typeFilter, uniqueValues(data, "type"));
    fillSelect(regionFilter, uniqueValues(data, "region"));
    fillSelect(yearFilter, uniqueValues(data, "year"));

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function filter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedType = typeFilter ? typeFilter.value : "";
      var selectedRegion = regionFilter ? regionFilter.value : "";
      var selectedYear = yearFilter ? yearFilter.value : "";
      var filtered = data.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.intro, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (selectedType && movie.type !== selectedType) {
          return false;
        }
        if (selectedRegion && movie.region !== selectedRegion) {
          return false;
        }
        if (selectedYear && movie.year !== selectedYear) {
          return false;
        }
        return true;
      });
      results.innerHTML = filtered.map(renderMovieCard).join("");
      if (title) {
        title.textContent = query || selectedType || selectedRegion || selectedYear ? "筛选结果" : "影片片单";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filter();
    });
    [input, typeFilter, regionFilter, yearFilter].forEach(function (element) {
      if (element) {
        element.addEventListener("input", filter);
        element.addEventListener("change", filter);
      }
    });
    filter();
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayers();
    initSearch();
  });
})();
