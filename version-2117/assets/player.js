(function () {
    function initializeMoviePlayer(url) {
        var video = document.getElementById("movieVideo");
        var cover = document.querySelector(".player-cover");
        var playButton = document.getElementById("playButton");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !url) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;
})();
