(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");

        if (header) {
            var refresh = function () {
                if (window.scrollY > 20) {
                    header.classList.add("scrolled");
                } else {
                    header.classList.remove("scrolled");
                }
            };

            refresh();
            window.addEventListener("scroll", refresh, { passive: true });
        }

        if (toggle) {
            toggle.addEventListener("click", function () {
                document.body.classList.toggle("menu-open");
            });
        }
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function render(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
                slide.classList.toggle("past", slideIndex < current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function move(step) {
            render(current + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                render(dotIndex);
                restart();
            });
        });

        render(0);
        restart();
    }

    function setupSearch() {
        var input = document.getElementById("search-input");
        var typeFilter = document.getElementById("type-filter");
        var yearFilter = document.getElementById("year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".search-empty");

        if (!input || cards.length === 0) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function filterCards() {
            var keyword = normalize(input.value);
            var selectedType = typeFilter ? typeFilter.value : "";
            var selectedYear = yearFilter ? yearFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.textContent
                ].join(" "));
                var cardType = card.getAttribute("data-type") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !selectedType || cardType === selectedType;
                var matchYear = !selectedYear || cardYear === selectedYear;
                var show = matchKeyword && matchType && matchYear;

                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("visible", visible === 0);
            }
        }

        input.addEventListener("input", filterCards);
        if (typeFilter) {
            typeFilter.addEventListener("change", filterCards);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", filterCards);
        }
        filterCards();
    }

    window.initializePlayer = function (videoId, overlayId, mediaUrl) {
        ready(function () {
            var video = document.getElementById(videoId);
            var overlay = document.getElementById(overlayId);
            var hlsInstance = null;

            if (!video || !mediaUrl) {
                return;
            }

            function attachMedia() {
                if (video.dataset.ready === "yes") {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(mediaUrl);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = mediaUrl;
                } else {
                    video.src = mediaUrl;
                }

                video.dataset.ready = "yes";
            }

            function play() {
                attachMedia();
                if (overlay) {
                    overlay.classList.add("hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
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
                    overlay.classList.add("hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        setupHeader();
        setupHero();
        setupSearch();
    });
})();
