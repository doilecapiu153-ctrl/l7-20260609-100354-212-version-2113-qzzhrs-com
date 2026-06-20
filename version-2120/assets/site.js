(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHeader() {
        var header = document.querySelector('[data-site-header]');
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

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

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });

        if (toggle && mobileNav && header) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
                header.classList.toggle('is-open', mobileNav.classList.contains('is-open'));
            });
        }
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute('data-filter-scope');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }

            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var searchInput = panel.querySelector('[data-search-input]');
            var categoryFilter = panel.querySelector('[data-category-filter]');
            var typeFilter = panel.querySelector('[data-type-filter]');
            var yearFilter = panel.querySelector('[data-year-filter]');
            var countNode = panel.querySelector('[data-result-count]');
            var empty = panel.parentElement ? panel.parentElement.querySelector('[data-empty-message]') : null;

            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }

            function matches(card) {
                var keyword = normalize(searchInput && searchInput.value);
                var category = normalize(categoryFilter && categoryFilter.value);
                var type = normalize(typeFilter && typeFilter.value);
                var year = normalize(yearFilter && yearFilter.value);
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' '));

                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (category && normalize(card.getAttribute('data-category')) !== category) {
                    return false;
                }
                if (type && normalize(card.getAttribute('data-type')) !== type) {
                    return false;
                }
                if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (countNode) {
                    countNode.textContent = String(visible);
                }
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            ['input', 'change'].forEach(function (eventName) {
                panel.addEventListener(eventName, apply);
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-player-button]');
            var src = player.getAttribute('data-src');
            var hlsInstance = null;

            if (!video || !src) {
                return;
            }

            function loadSource() {
                if (player.classList.contains('is-loaded')) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }

                player.classList.add('is-loaded');
            }

            function play() {
                loadSource();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });

            video.addEventListener('ended', function () {
                player.classList.remove('is-playing');
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    function initShareButtons() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-share]'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var payload = {
                    title: document.title,
                    url: window.location.href
                };

                if (navigator.share) {
                    navigator.share(payload).catch(function () {});
                    return;
                }

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href).then(function () {
                        button.textContent = '已复制链接';
                        window.setTimeout(function () {
                            button.textContent = '分享';
                        }, 1600);
                    });
                }
            });
        });
    }

    function initBackTop() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-back-top]'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    ready(function () {
        initHeader();
        initHeroSlider();
        initFilters();
        initPlayers();
        initShareButtons();
        initBackTop();
    });
})();
