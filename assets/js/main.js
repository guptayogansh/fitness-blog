/* Prime Routine — site behaviour. No dependencies. */
(function () {
  'use strict';

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');

  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function paintToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    toggle.textContent = dark ? '☀' : '☾';
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      paintToggle();
    });
    paintToggle();
  }

  /* ---------- year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- just published ---------- */
  /* The editor sends you here as index.html?new=<slug> so the page cannot be
     answered from a cache that predates the post. Once it has loaded, tidy
     the parameter away and point out the new card. */
  var justPublished = (location.search.match(/[?&]new=([^&]+)/) || [])[1];
  if (justPublished) {
    try {
      history.replaceState(null, '', location.pathname + location.hash);
    } catch (e) { /* older browsers keep the query, which is harmless */ }
  }

  /* ---------- search + tag filter ---------- */
  var grid = document.querySelector('[data-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-post]'));
    var input = document.querySelector('[data-search]');
    var tagBtns = Array.prototype.slice.call(document.querySelectorAll('[data-tag]'));
    var empty = document.querySelector('[data-empty]');
    var sortBtns = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));
    var activeTag = 'all';
    var newestFirst = true;

    var MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december'];

    /* "2026-08" also answers to "august 2026", "aug", and "august". */
    function dateWords(iso) {
      var parts = String(iso || '').split('-');
      var month = MONTHS[Number(parts[1]) - 1];
      if (!month) return iso || '';
      return [iso, month, month.slice(0, 3), month + ' ' + parts[0], parts[0]].join(' ');
    }

    cards.forEach(function (card) {
      card.searchText = [
        card.getAttribute('data-post') || '',
        card.getAttribute('data-tags') || '',
        dateWords(card.getAttribute('data-date'))
      ].join(' ').toLowerCase();
    });

    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(',');
        /* Every word typed has to appear somewhere, so "cardio july" narrows
           rather than widening the way a single-substring match would. */
        var matchesText = !q || q.split(/\s+/).every(function (word) {
          return card.searchText.indexOf(word) !== -1;
        });
        var matchesTag = activeTag === 'all' || tags.indexOf(activeTag) !== -1;
        var show = matchesText && matchesTag;
        card.hidden = !show;
        if (show) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
    }

    if (input) input.addEventListener('input', apply);

    tagBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTag = btn.getAttribute('data-tag');
        tagBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        apply();
      });
    });

    /* Reordering the actual nodes keeps the grid honest — the empty-state
       row has to stay last whichever way the sort runs. */
    function sort() {
      var placeholder = grid.querySelector('[data-empty]');
      cards.slice().sort(function (a, b) {
        var x = a.getAttribute('data-date') || '';
        var y = b.getAttribute('data-date') || '';
        return newestFirst ? y.localeCompare(x) : x.localeCompare(y);
      }).forEach(function (card) {
        grid.appendChild(card);
      });
      if (placeholder) grid.appendChild(placeholder);
    }

    sortBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        newestFirst = btn.getAttribute('data-sort') === 'newest';
        sortBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        sort();
      });
    });

    sort();
    apply();

    /* Draw the eye to the card that was just published. */
    if (justPublished) {
      var fresh = grid.querySelector('a[href="posts/' + justPublished + '.html"]');
      var freshCard = fresh && fresh.closest('.card');
      if (freshCard) {
        freshCard.classList.add('just-published');
        setTimeout(function () { freshCard.classList.remove('just-published'); }, 2600);
      }
    }
  }

  /* ---------- newsletter (no backend — swap the action for a real one) ---------- */
  var form = document.querySelector('[data-subscribe]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.parentNode.querySelector('[data-note]');
      var email = form.querySelector('input[type="email"]');
      if (!note || !email) return;
      note.textContent = 'Thanks — ' + email.value +
        ' is on the list. (Demo only: wire this form up to a real service.)';
      form.reset();
    });
  }
})();
