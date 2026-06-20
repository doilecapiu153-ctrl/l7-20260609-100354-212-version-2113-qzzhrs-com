(function () {
  function getStatus(button) {
    var panel = button.closest('.player-panel');
    return panel ? panel.querySelector('[data-player-status]') : null;
  }

  function setStatus(status, text) {
    if (status) {
      status.textContent = text;
    }
  }

  function playNative(video, source, status) {
    video.src = source;
    video.dataset.ready = '1';
    video.play().then(function () {
      setStatus(status, '正在播放');
    }).catch(function () {
      setStatus(status, '请再次点击播放器上的播放按钮');
    });
  }

  function playWithHls(video, source, status) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.dataset.ready = '1';
      video.play().then(function () {
        setStatus(status, '正在播放');
      }).catch(function () {
        setStatus(status, '请再次点击播放器上的播放按钮');
      });
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus(status, '播放连接暂时不可用，请稍后重试');
        hls.destroy();
      }
    });
  }

  function startPlayer(button) {
    var targetId = button.getAttribute('data-player-target');
    var video = document.getElementById(targetId);
    var status = getStatus(button);
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    if (!source) {
      setStatus(status, '未找到播放地址');
      return;
    }
    if (video.dataset.ready === '1') {
      video.play();
      return;
    }
    setStatus(status, '正在载入影片');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      playNative(video, source, status);
    } else if (window.Hls && window.Hls.isSupported()) {
      playWithHls(video, source, status);
    } else {
      playNative(video, source, status);
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-player-target]');
    if (!button) {
      return;
    }
    startPlayer(button);
  });
})();
