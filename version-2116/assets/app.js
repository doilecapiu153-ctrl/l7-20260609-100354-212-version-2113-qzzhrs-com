(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                var expanded = menuButton.getAttribute("aria-expanded") === "true";
                menuButton.setAttribute("aria-expanded", String(!expanded));
                mobilePanel.hidden = expanded;
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
            var current = 0;
            var timer = null;

            function activate(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
                thumbs.forEach(function (thumb, thumbIndex) {
                    thumb.classList.toggle("is-active", thumbIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    activate(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    activate(index);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            activate(0);
            start();
        }

        var searchInput = document.getElementById("pageSearch");
        var yearFilter = document.getElementById("yearFilter");
        var typeFilter = document.getElementById("typeFilter");
        var filterGrid = document.querySelector("[data-filter-grid]");
        if (searchInput && filterGrid) {
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q");
            if (queryValue) {
                searchInput.value = queryValue;
            }

            function applyFilters() {
                var keyword = searchInput.value.trim().toLowerCase();
                var year = yearFilter ? yearFilter.value : "";
                var type = typeFilter ? typeFilter.value : "";
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-text") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !year || cardYear === year;
                    var matchType = !type || cardType === type;
                    card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchType));
                });
            }

            searchInput.addEventListener("input", applyFilters);
            if (yearFilter) {
                yearFilter.addEventListener("change", applyFilters);
            }
            if (typeFilter) {
                typeFilter.addEventListener("change", applyFilters);
            }
            applyFilters();
        }
    });
})();

function setupMoviePlayer(source) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    var loaded = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function play() {
        load();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("ended", function () {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
