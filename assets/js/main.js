/* Iron & Interval — site behaviour. No dependencies. */
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

  /* ---------- search + tag filter ---------- */
  var grid = document.querySelector('[data-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-post]'));
    var input = document.querySelector('[data-search]');
    var tagBtns = Array.prototype.slice.call(document.querySelectorAll('[data-tag]'));
    var empty = document.querySelector('[data-empty]');
    var activeTag = 'all';

    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-post') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').split(',');
        var matchesText = !q || haystack.indexOf(q) !== -1;
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

    apply();
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
