(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-inline-filter]'));

    filterRoots.forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var area = document.querySelector('[data-filter-area]');
        var activeYear = 'all';
        var activeKeyword = 'all';

        if (!area) {
            return;
        }

        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
        }

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = cardText(card);
                var yearMatched = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
                var keywordMatched = activeKeyword === 'all' || text.indexOf(activeKeyword.toLowerCase()) !== -1;
                var searchMatched = keyword === '' || text.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !(yearMatched && keywordMatched && searchMatched));
            });
        }

        if (input) {
            input.value = queryFromUrl;
            input.addEventListener('input', applyFilters);
        }

        root.querySelectorAll('[data-year-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-year-filter') || 'all';
                applyFilters();
            });
        });

        root.querySelectorAll('[data-keyword-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeKeyword = button.getAttribute('data-keyword-filter') || 'all';
                applyFilters();
            });
        });

        applyFilters();
    });

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var source = shell.getAttribute('data-src');
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !video || !source) {
                return;
            }

            prepared = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function () {
                shell.classList.add('is-playing');
                play();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    shell.classList.add('is-playing');
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
