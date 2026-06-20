(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setHeader() {
        var header = document.querySelector("[data-header]");
        if (!header) {
            return;
        }
        var update = function () {
            if (window.scrollY > 20) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function setMobileMenu() {
        var header = document.querySelector("[data-header]");
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            if (header) {
                header.classList.toggle("menu-open", menu.classList.contains("open"));
            }
        });
    }

    function setBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function setHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        var show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        };
        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setCardsSearch() {
        var input = document.querySelector("[data-search-input]");
        var grid = document.querySelector("[data-card-grid]") || document;
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-no-result]");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }
        var apply = function () {
            var query = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var target = normalize(card.getAttribute("data-search"));
                var match = !query || target.indexOf(query) !== -1;
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };
        input.addEventListener("input", apply);
        apply();
    }

    function setFilterBar() {
        var bar = document.querySelector("[data-filter-bar]");
        var grid = document.querySelector("[data-card-grid]");
        if (!bar || !grid) {
            return;
        }
        var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-no-result]");
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                var value = normalize(button.getAttribute("data-filter"));
                var visible = 0;
                cards.forEach(function (card) {
                    var target = normalize([
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-search")
                    ].join(" "));
                    var match = value === "all" || target.indexOf(value) !== -1;
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            });
        });
    }

    ready(function () {
        setHeader();
        setMobileMenu();
        setBackTop();
        setHero();
        setCardsSearch();
        setFilterBar();
    });
}());

function initializeMoviePlayer(streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
        return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var status = shell.querySelector("[data-player-status]");
    var loaded = false;
    var hls = null;

    function writeStatus(value) {
        if (status) {
            status.textContent = value || "";
        }
    }

    function attachAndPlay() {
        writeStatus("正在加载");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            loaded = true;
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                loaded = true;
                playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function () {
                if (!loaded) {
                    video.src = streamUrl;
                    loaded = true;
                    playVideo();
                }
            });
            return;
        }
        video.src = streamUrl;
        loaded = true;
        playVideo();
    }

    function playVideo() {
        if (button) {
            button.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.then === "function") {
            promise.then(function () {
                writeStatus("");
            }).catch(function () {
                writeStatus("点击继续播放");
            });
        } else {
            writeStatus("");
        }
    }

    function start() {
        if (!loaded) {
            attachAndPlay();
        } else {
            playVideo();
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (!loaded) {
            start();
        } else if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("playing", function () {
        writeStatus("");
    });
    video.addEventListener("waiting", function () {
        writeStatus("正在缓冲");
    });
    window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
}
