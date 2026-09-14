// При открытии и обновлении — всегда с первого экрана
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

// Ступенчатое появление, активный раздел в шапке, тема сообщения для кнопок записи, год.
(function () {
  var items = document.querySelectorAll('.rv');
  function showAll() { items.forEach(function (el) { el.classList.add('on'); }); }
  if ('IntersectionObserver' in window) {
    var queue = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, delay = (queue++ % 6) * 70;
        setTimeout(function () { el.classList.add('on'); }, delay);
        setTimeout(function () { queue = Math.max(0, queue - 1); }, 400);
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 2500);
  } else { showAll(); }

  var sections = [];
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) sections.push({ a: a, s: s });
  });
  function onScroll() {
    var y = window.scrollY, cur = null;
    sections.forEach(function (x) { if (x.s.offsetTop <= y + 100) cur = x; });
    sections.forEach(function (x) { x.a.classList.toggle('on', x === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Окна: запись (Telegram, WhatsApp, звонок) и цены. Нет Telegram — есть WhatsApp и звонок.
  var tg = document.getElementById('tg'), wa = document.getElementById('wa');
  var book = document.getElementById('sheet'), prices = document.getElementById('prices');
  var sTg = document.getElementById('sheet-tg'), sWa = document.getElementById('sheet-wa');
  var openEl = null, lastFocus = null;
  function setMsg(msg) {
    var q = encodeURIComponent(msg);
    [tg, sTg].forEach(function (a) { if (a) a.href = 'https://t.me/shabarshov?text=' + q; });
    [wa, sWa].forEach(function (a) { if (a) a.href = 'https://wa.me/79969669160?text=' + q; });
  }
  var closeT = null, closingEl = null;
  function open(el, focusEl) {
    if (!el) return false;
    clearTimeout(closeT);
    if (closingEl && closingEl !== el) { closingEl.hidden = true; }
    closingEl = null;
    if (openEl && openEl !== el) { openEl.classList.remove('is-in'); openEl.hidden = true; } else if (!openEl) lastFocus = document.activeElement;
    el.hidden = false; openEl = el; document.documentElement.style.overflow = 'hidden';
    void el.offsetWidth; el.classList.add('is-in');
    var f = focusEl || el.querySelector('.sheet__x'); if (f) f.focus({ preventScroll: true });
    return true;
  }
  function close() {
    if (!openEl) return;
    var el = openEl; openEl = null; closingEl = el; el.classList.remove('is-in');
    closeT = setTimeout(function () { el.hidden = true; closingEl = null; document.documentElement.style.overflow = ''; }, 480);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-msg], a.js-prices, [data-close]');
    if (!a) return;
    if (a.hasAttribute('data-close')) { close(); return; }
    if (a.classList.contains('js-prices')) { if (open(prices)) e.preventDefault(); return; }
    var msg = a.getAttribute('data-msg');
    if (a.classList.contains('js-book') && open(book, sTg)) { setMsg(msg); e.preventDefault(); } else { setMsg(msg); }
  });
  if (book) book.querySelectorAll('.sheet__btn').forEach(function (el) { el.addEventListener('click', function () { setTimeout(close, 300); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab' && openEl) {
      var f = openEl.querySelectorAll('a[href], button'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      else if (!openEl.contains(document.activeElement)) { first.focus(); e.preventDefault(); }
    }
  });

  // Карта: на телефоне нажатие на метку показывает адрес и расписание в плашке под картой
  var map = document.querySelector('.citymap'), panel = document.querySelector('.citymap__panel');
  if (map && panel) {
    map.addEventListener('click', function (e) {
      if (e.target.closest('.mpin__more a')) return;
      var pin = e.target.closest('.mpin');
      if (!pin) return;
      show(pin);
    });
    var show = function (pin) {
      map.querySelectorAll('.mpin.is-open').forEach(function (p) { p.classList.remove('is-open'); p.querySelector('.mpin__dot').setAttribute('aria-expanded', 'false'); });
      pin.classList.add('is-open'); pin.querySelector('.mpin__dot').setAttribute('aria-expanded', 'true');
      panel.innerHTML = pin.querySelector('.mpin__card').innerHTML;
    };
    var first = map.querySelector('.mpin');
    if (first && window.matchMedia('(max-width: 900px)').matches) show(first);
  }

  // Яндекс.Метрика: номер счётчика в <html data-ym="">. Пусто — ничего не грузится.
  var ym_id = document.documentElement.getAttribute('data-ym');
  if (ym_id) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = +new Date();
    var s = document.createElement('script'); s.async = true; s.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.appendChild(s);
    window.ym(+ym_id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      var h = a.getAttribute('href') || '', goal = null;
      if (a.classList.contains('js-book')) goal = 'zapis';
      else if (a.classList.contains('pay')) goal = 'oplata';
      else if (h.indexOf('tel:') === 0) goal = 'zvonok';
      else if (h.indexOf('t.me/shabarshov?') > -1) goal = 'telegram';
      else if (h.indexOf('wa.me/') > -1) goal = 'whatsapp';
      if (goal) window.ym(+ym_id, 'reachGoal', goal);
    });
  }

  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();



// Переходы по разделам: мягкая прокрутка с плавным разгоном и торможением, раздел по центру экрана
(function () {
  var raf = null;
  function smoothTo(to) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollTo(0, to); return; }
    var from = window.scrollY, dist = to - from, dur = Math.min(1400, Math.max(700, Math.abs(dist) * 0.35)), t0 = null;
    var html = document.documentElement, prev = html.style.scrollBehavior; html.style.scrollBehavior = 'auto';
    cancelAnimationFrame(raf);
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, from + dist * ease(k));
      if (k < 1) raf = requestAnimationFrame(step); else done();
    }
    var stops = ['wheel', 'touchstart', 'keydown'];
    function stop() { cancelAnimationFrame(raf); done(); }
    function done() { html.style.scrollBehavior = prev; stops.forEach(function (ev) { window.removeEventListener(ev, stop); }); }
    stops.forEach(function (ev) { window.addEventListener(ev, stop, { passive: true }); });
    raf = requestAnimationFrame(step);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains('js-book') || a.classList.contains('js-prices')) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    if (id === '#top') { e.preventDefault(); smoothTo(0); return; }
    var sec = document.querySelector(id); if (!sec || !sec.classList.contains('band')) return;
    var target = sec.querySelector('.wrap') || sec;
    var nav = document.querySelector('.nav'), navH = nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0;
    var r = target.getBoundingClientRect(), avail = window.innerHeight - navH;
    var gap = Math.max(32, (avail - r.height) / 2);
    var y = r.top + window.scrollY - navH - gap;
    e.preventDefault();
    smoothTo(Math.max(0, y));
  });
})();

// «Три формата»: вторая строка заголовка сменяется по кругу (компьютер)
(function () {
  var box = document.querySelector('.rot'); if (!box) return;
  var items = box.querySelectorAll('.rot__i'), i = 0;
  if (!window.matchMedia('(min-width: 901px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(function () {
    if (document.hidden) return;
    var cur = items[i]; i = (i + 1) % items.length; var nx = items[i];
    cur.classList.remove('is-on'); cur.classList.add('is-off'); cur.setAttribute('aria-hidden', 'true');
    nx.classList.remove('is-off'); nx.classList.add('is-on'); nx.removeAttribute('aria-hidden');
    setTimeout(function () { cur.classList.remove("is-off"); }, 1800);
  }, 6000);
})();

// Вопросы: ответ мягко выезжает, закрывается так же плавно
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.qa').forEach(function (d) { d.addEventListener('toggle', function () { d.classList.toggle('is-open', d.open); }); });
    return;
  }
  var ease = 'cubic-bezier(.16, 1, .3, 1)';
  document.querySelectorAll('.qa').forEach(function (d) {
    var s = d.querySelector('summary'), p = d.querySelector('p'); if (!p || !p.animate) return;
    var busy = false;
    s.addEventListener('click', function (e) {
      e.preventDefault(); if (busy) return; busy = true;
      if (!d.open) {
        d.open = true; d.classList.add('is-open');
        var h = p.offsetHeight;
        var f1 = false, done1 = function () { if (!f1) { f1 = true; busy = false; } }; setTimeout(done1, 800);
        p.animate([{ height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-10px)' }, { height: h + 'px', paddingBottom: getComputedStyle(p).paddingBottom, opacity: 1, transform: 'none' }], { duration: 650, easing: ease }).onfinish = done1;
      } else {
        d.classList.remove('is-open');
        var a = p.animate([{ height: p.offsetHeight + 'px', paddingBottom: getComputedStyle(p).paddingBottom, opacity: 1, transform: 'none' }, { height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-8px)' }], { duration: 450, easing: ease, fill: 'forwards' });
        var f2 = false, done2 = function () { if (!f2) { f2 = true; d.open = false; a.cancel(); busy = false; } }; setTimeout(done2, 600); a.onfinish = done2;
      }
    });
  });
})();

// Шапка прозрачная, пока страница наверху
(function () {
  var nav = document.querySelector('.nav'); if (!nav) return;
  function upd() { nav.classList.toggle('is-top', window.scrollY < 24); }
  window.addEventListener('scroll', upd, { passive: true }); upd();
})();

// Телефон: плашка «Связаться» появляется после первого экрана и прячется у финала
(function () {
  var hero = document.querySelector('.hero:not(.hero--end)'), end = document.getElementById('zapis');
  if (!hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (e) { document.body.classList.toggle('past-hero', !e[0].isIntersecting); }, { threshold: 0.15 }).observe(hero);
  if (end) new IntersectionObserver(function (e) { document.body.classList.toggle('at-end', e[0].isIntersecting); }, { threshold: 0.2 }).observe(end);
})();

// Фото тренера: медленная смена кадров — кадр тает с лёгким приближением, следующий проявляется
(function () {
  var box = document.querySelector('.slides'); if (!box) return;
  var items = box.querySelectorAll('.slide'), i = 0;
  if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(function () {
    if (document.hidden) return;
    var cur = items[i]; i = (i + 1) % items.length; var nx = items[i];
    cur.classList.remove('is-on'); cur.setAttribute('aria-hidden', 'true');
    nx.classList.add('is-on'); nx.removeAttribute('aria-hidden');
  }, 5200);
})();

