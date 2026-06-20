(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var searchInput = document.getElementById('site-search');
    var filterGrid = document.querySelector('[data-filter-grid]');
    var noResults = document.querySelector('[data-no-results]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 32) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    function setupMenu() {
        if (!header || !menuButton) {
            return;
        }
        menuButton.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        }

        function run() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                run();
            });
        });

        run();
    }

    function setupFilter() {
        if (!searchInput || !filterGrid) {
            return;
        }
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-filter-text]'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;

        function filter() {
            var query = searchInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                var match = !query || text.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        searchInput.addEventListener('input', filter);
        filter();
    }

    function setupPlayer() {
        var video = document.getElementById('moviePlayer');
        var button = document.querySelector('[data-play-button]');
        if (!video || typeof streamUrl !== 'string' || !streamUrl) {
            return;
        }
        var ready = false;
        var hlsInstance = null;

        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function play() {
            prepare();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateHeader();
        setupMenu();
        setupHero();
        setupFilter();
        setupPlayer();
    });

    window.addEventListener('scroll', updateHeader, { passive: true });
}());
