(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show((active + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    function setupImages() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img"));
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    function setupSearchPage() {
        var box = document.querySelector("#searchInput");
        var results = document.querySelector("#searchResults");
        var form = document.querySelector("#searchForm");
        if (!box || !results || !form || !window.searchData) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        box.value = initial;

        function card(item) {
            return [
                '<a class="movie-card" href="' + item.url + '" title="' + escapeHtml(item.title) + '">',
                '<div class="poster-frame">',
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="badge">' + escapeHtml(item.type) + '</span>',
                '<span class="play-mark">▶</span>',
                '</div>',
                '<div class="card-body">',
                '<h3>' + escapeHtml(item.title) + '</h3>',
                '<p>' + escapeHtml(item.one) + '</p>',
                '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
                '</div>',
                '</a>'
            ].join("");
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function runSearch(value) {
            var query = value.trim().toLowerCase();
            if (!query) {
                results.innerHTML = '<div class="empty-state">输入片名、地区、年份、类型或标签开始搜索。</div>';
                return;
            }
            var words = query.split(/\s+/).filter(Boolean);
            var matched = window.searchData.filter(function (item) {
                var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.one, item.category].join(" ").toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 80);
            if (!matched.length) {
                results.innerHTML = '<div class="empty-state">没有找到相关影片。</div>';
                return;
            }
            results.innerHTML = '<div class="movie-grid">' + matched.map(card).join("") + '</div>';
            setupImages();
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = box.value.trim();
            var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.history.replaceState(null, "", url);
            runSearch(value);
        });

        runSearch(initial);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupImages();
        setupSearchPage();
    });
})();
