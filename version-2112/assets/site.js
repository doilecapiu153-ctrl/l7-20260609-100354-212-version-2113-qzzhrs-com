(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function parseQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = document.querySelector('[data-card-search]');
    if (q && input) {
      input.value = q;
    }
  }

  function setupCardFilters() {
    var list = document.querySelector('[data-card-list]');
    var input = document.querySelector('[data-card-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var empty = document.querySelector('[data-empty-message]');
    if (!list || (!input && !yearFilter)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-item'));

    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      var numericYear = Number(cardYear || 0);
      var numericSelected = Number(selected || 0);
      if (selected === '2010' || selected === '2000') {
        return numericYear >= numericSelected;
      }
      return numericYear === numericSelected;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = yearFilter ? yearFilter.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var ok = (!keyword || search.indexOf(keyword) !== -1) && matchYear(cardYear, selectedYear);
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    setupHeroCarousel();
    parseQuerySearch();
    setupCardFilters();
  });
})();
