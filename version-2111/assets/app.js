(function () {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (button && nav) {
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function move(step) {
      show(active + step);
    }

    function start() {
      stop();
      timer = setInterval(function () {
        move(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const yearFilter = document.querySelector('[data-filter-year]');
  const typeFilter = document.querySelector('[data-filter-type]');
  const items = Array.from(document.querySelectorAll('[data-search-item]'));

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';

    items.forEach(function (item) {
      const text = (item.dataset.keywords || '').toLowerCase();
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesYear = !year || item.dataset.year === year;
      const matchesType = !type || item.dataset.type === type;
      item.classList.toggle('is-hidden', !(matchesQuery && matchesYear && matchesType));
    });
  }

  if (searchInput || yearFilter || typeFilter) {
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }
  }
})();
