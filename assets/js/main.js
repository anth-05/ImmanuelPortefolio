(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- mobile menu ---------- */
  var menuBtn = $('.menu-btn'), sheet = $('#menu');
  function setMenu(open) {
    if (!menuBtn || !sheet) return;
    sheet.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    if (open) { var first = sheet.querySelector('a'); if (first) first.focus(); }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(sheet.hidden); });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!sheet.hidden && !e.target.closest('.capsule')) setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- active section in nav ---------- */
  var links = $$('.nav-links a, .sheet a');
  var sections = ['wat-ik-doe', 'tijdlijn', 'verhaal', 'ervaring', 'waarom', 'contact']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- timeline ---------- */
  var T = [
    { y: '2002', t: 'Geboren', e: 'Ik werd geboren.', c: 'Er kwam een nieuw lichtpunt in het leven van mijn ouders.' },
    { y: '2014', t: 'Havo/vwo', e: 'Ik ging naar de eerste klas havo/vwo.', c: 'Ik begon te beseffen dat ik, net als mijn vader, een hart voor de zorg heb.' },
    { y: '2015', t: 'Drumles', e: 'Ik begon met drumles.', c: 'Ik ontdekte een verborgen talent voor muziek, vooral voor percussie.' },
    { y: '2015', t: 'Sparen', e: 'Ons gezin kwam in een financiële crisis terecht.', c: 'Ik leerde de waarde van geld kennen en zag dat niets vanzelfsprekend is. Ik ging werken en leerde goed sparen. Daar heb ik later veel aan gehad.' },
    { y: '2019', t: 'Mbo 4', e: 'Ik ging van 4 havo naar mbo 4.', c: 'Ik kreeg weer plezier in school, en dit keer werkte ik doelgerichter.' },
    { y: '2021', t: 'Knippen', e: 'Ik begon met knippen.', c: 'Ik leerde op eigen benen te staan en nog harder te werken voor mijn geld. Ik werd verantwoordelijker.' },
    { y: '2024', t: 'Diploma', e: 'Ik ontving mijn diploma.', c: 'Ik kon eindelijk mijn beroep uitoefenen.' },
    { y: '2024', t: 'Vader', e: 'Mijn zoon werd geboren.', c: 'Een extra motivatie om nog harder achter mijn doelen aan te gaan.' },
    { y: '2025', t: 'Eigen zaak', e: 'Ik opende mijn eigen kapperszaak, PrimeCuts.', c: 'Het was geen geintje meer. De zaken werden serieuzer dan ooit en mijn ondernemersvaardigheden werden op de proef gesteld.' },
    { y: '2026', t: 'Brivaro', e: 'Ik ben begonnen aan Brivaro.', c: 'Er gaat een hele nieuwe kant van ondernemen voor mij open. Nu combineer ik passie en karakter met kennis en ervaring.' }
  ];
  var list = $('#years'), panel = $('#moment');
  if (list && panel) {
    var i = 0;
    var tabs = T.map(function (m, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.id = 'tab-' + k;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'moment');
      b.setAttribute('aria-label', m.y + ', ' + m.t);
      b.innerHTML = '<b>' + m.y + '</b><small>' + m.t + '</small>';
      b.addEventListener('click', function () { select(k, false); });
      list.appendChild(b);
      return b;
    });
    list.addEventListener('keydown', function (e) {
      var map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in map) { e.preventDefault(); select(Math.max(0, Math.min(T.length - 1, i + map[e.key])), true); }
      else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      else if (e.key === 'End') { e.preventDefault(); select(T.length - 1, true); }
    });
    $('#prev').addEventListener('click', function () { if (i > 0) select(i - 1, false); });
    $('#next').addEventListener('click', function () { if (i < T.length - 1) select(i + 1, false); });

    function select(k, focusTab) {
      i = k; var m = T[k];
      tabs.forEach(function (b, n) {
        var on = n === k;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (focusTab) tabs[k].focus();
      panel.setAttribute('aria-labelledby', 'tab-' + k);
      $('#yr').textContent = m.y;
      $('#ev').textContent = m.e;
      $('#ch').textContent = m.c;
      $('#count').textContent = (k + 1) + ' van ' + T.length;
      $('#prev').disabled = k === 0;
      $('#next').disabled = k === T.length - 1;
      panel.classList.remove('fade-in'); void panel.offsetWidth; panel.classList.add('fade-in');
    }
    select(0, false);
  }

  /* ---------- copy to clipboard ---------- */
  var toast = $('#toast'), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }
  $$('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.querySelector('span');
      function done(ok) {
        if (ok) {
          btn.setAttribute('data-done', '');
          if (label) label.textContent = 'Gekopieerd';
          say('Gekopieerd: ' + text);
          setTimeout(function () { btn.removeAttribute('data-done'); if (label) label.textContent = 'Kopieer'; }, 2000);
        } else {
          say('Kopiëren lukte niet. Selecteer de tekst handmatig.');
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
      } else { done(fallback(text)); }
    });
  });
  function fallback(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
    } catch (e) { return false; }
  }

  /* ---------- footer year ---------- */
  var y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
})();
