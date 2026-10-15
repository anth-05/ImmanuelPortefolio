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

  /* ---------- bubble: one pill that travels between items, stretching like a drop ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function rectOf(el) { return { l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; }
  function px(r) { return { left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px' }; }
  function bubble(container, className) {
    var pill = document.createElement('span'), anim, shown = false, current = null;
    pill.className = className; pill.setAttribute('aria-hidden', 'true');
    container.insertBefore(pill, container.firstChild);
    function move(el, animateIt) {
      current = el;
      var from = rectOf(pill), to = rectOf(el); // from = live on-screen value, so interrupts never jump
      var wasShown = shown; shown = true;
      if (anim) anim.cancel();
      Object.assign(pill.style, px(to)); pill.style.opacity = 1;
      if (!animateIt || reduceMotion.matches || !pill.animate || !to.w) return;
      if (!wasShown || !from.w) {
        // nothing to travel from: grow in place
        anim = pill.animate([{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
        return;
      }
      var frames, duration;
      if (Math.abs(from.t - to.t) < 2) {
        // same row: leading edge runs ahead, trailing edge lags, height squashes slightly
        var fwd = to.l > from.l, lead = 0.8, trail = 0.3;
        var L = from.l + (to.l - from.l) * (fwd ? trail : lead);
        var R = from.l + from.w + (to.l + to.w - from.l - from.w) * (fwd ? lead : trail);
        var h = to.h * 0.86, ww = to.w * 1.04;
        frames = [
          px(from),
          Object.assign(px({ l: L, t: to.t + (to.h - h) / 2, w: R - L, h: h }), { offset: 0.45 }),
          Object.assign(px({ l: to.l - (ww - to.w) / 2, t: to.t + to.h * 0.02, w: ww, h: to.h * 0.96 }), { offset: 0.8 }),
          px(to)
        ];
        duration = 320 + Math.min(200, Math.abs(to.l - from.l) * 0.35);
      } else {
        // different row: shrink while travelling, swell back in place
        var w2 = to.w * 0.7, h2 = to.h * 0.7;
        frames = [
          px(from),
          Object.assign(px({ l: (from.l + to.l) / 2 + (to.w - w2) / 2, t: (from.t + to.t) / 2 + (to.h - h2) / 2, w: w2, h: h2 }), { offset: 0.45 }),
          px(to)
        ];
        duration = 420;
      }
      anim = pill.animate(frames, { duration: duration, easing: 'cubic-bezier(.4,0,.2,1)' });
    }
    function hide() {
      if (!shown) return;
      shown = false; current = null;
      if (anim) anim.cancel();
      pill.style.opacity = 0;
      if (!reduceMotion.matches && pill.animate) anim = pill.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out' });
    }
    if ('ResizeObserver' in window) new ResizeObserver(function () { if (current) move(current, false); }).observe(container);
    return { move: move, hide: hide };
  }

  /* ---------- active section in nav ---------- */
  var links = $$('.nav-links a, .sheet a'), navLinks = $('.nav-links');
  var navBubble = navLinks && bubble(navLinks, 'nav-pill');
  // the hero is observed too: no link matches it, so the bubble leaves when you're back at the top
  var sections = ['top', 'wat-ik-doe', 'tijdlijn', 'verhaal', 'ervaring', 'waarom', 'contact']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id, active = null;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) {
            a.setAttribute('aria-current', 'true');
            if (navLinks && navLinks.contains(a)) active = a;
          } else a.removeAttribute('aria-current');
        });
        if (navBubble) { if (active) navBubble.move(active, true); else navBubble.hide(); }
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
  var list = $('#years'), panel = $('#moment'), body = $('#moment-body');
  if (list && panel) {
    var i = 0, anim;
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
    var yearsBubble = bubble(list, 'years-pill');

    $('#prev').addEventListener('click', function () { if (i > 0) select(i - 1, false); });
    $('#next').addEventListener('click', function () { if (i < T.length - 1) select(i + 1, false); });

    function select(k, focusTab, initial) {
      var dir = k > i ? 1 : -1;
      i = k; var m = T[k];
      tabs.forEach(function (b, n) {
        var on = n === k;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (focusTab) tabs[k].focus();
      yearsBubble.move(tabs[k], !initial);
      panel.setAttribute('aria-labelledby', 'tab-' + k);
      $('#yr').textContent = m.y;
      $('#ev').textContent = m.e;
      $('#ch').textContent = m.c;
      $('#count').textContent = (k + 1) + ' van ' + T.length;
      $('#prev').disabled = k === 0;
      $('#next').disabled = k === T.length - 1;
      // Animate only the content (never the buttons under the finger), entering from
      // the direction of travel. Cancelling the previous run keeps rapid presses smooth.
      if (!initial && body && body.animate) {
        if (anim) anim.cancel();
        var from = reduceMotion.matches ? { opacity: 0.6 } : { opacity: 0.6, transform: 'translateX(' + (dir * 10) + 'px)' };
        var to = reduceMotion.matches ? { opacity: 1 } : { opacity: 1, transform: 'none' };
        anim = body.animate([from, to], { duration: reduceMotion.matches ? 150 : 280, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    }
    select(0, false, true);
  }

  /* ---------- copy to clipboard ---------- */
  var toast = $('#toast'), live = $('#live'), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }
  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 50);
  }
  $$('.copy').forEach(function (btn) {
    var resetTimer;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      function done(ok) {
        if (ok) {
          // the button itself is the visual feedback; screen readers get the live region
          btn.setAttribute('data-done', '');
          announce('Gekopieerd: ' + text);
          clearTimeout(resetTimer);
          resetTimer = setTimeout(function () { btn.removeAttribute('data-done'); }, 2000);
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

  /* ---------- scroll reveals ---------- */
  // Selector list mirrors the .js :is(...) rule in style.css.
  window.__reveal = true;
  var revealEls = $$('.sec-head, .role, .ticket, .s-photo, .s-copy > *, .cv-col, .whys li, .contact-grid .panel, .shop');
  if (document.documentElement.classList.contains('js') && revealEls.length) {
    var pending = revealEls.slice();
    var ro = new IntersectionObserver(function (entries) {
      var n = 0;
      // a fast jump can skip elements entirely; show anything now above the viewport
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().bottom < 0) { el.classList.add('in', 'now'); ro.unobserve(el); return false; }
        return true;
      });
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) {
          // items entering together get a short stagger, capped so nothing waits long
          el.style.transitionDelay = Math.min(n++, 5) * 80 + 'ms';
          el.classList.add('in');
          ro.unobserve(el);
          el.addEventListener('transitionend', function () { el.style.transitionDelay = ''; }, { once: true });
        } else if (en.boundingClientRect.top < 0) {
          // already scrolled past (deep link or reload mid-page): show without animating
          el.classList.add('in', 'now');
          ro.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- back to top (mobile) ---------- */
  var toTop = $('#to-top'), hero = $('.hero');
  if (toTop && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { toTop.hidden = entries[0].isIntersecting; }).observe(hero);
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      var brand = $('.brand'); if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- footer year ---------- */
  var y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
})();
