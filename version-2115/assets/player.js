(function () {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var configElement = document.getElementById('player-config');

  if (!video || !overlay || !configElement) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var streamUrl = config.src || '';
  var initialized = false;
  var hls = null;

  function attachStream() {
    if (initialized || !streamUrl) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    attachStream();
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!initialized) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
