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
  var closeT = null;
  function open(el, focusEl) {
    if (!el) return false;
    clearTimeout(closeT);
    if (openEl && openEl !== el) { openEl.classList.remove('is-in'); openEl.hidden = true; } else if (!openEl) lastFocus = document.activeElement;
    el.hidden = false; openEl = el; document.documentElement.style.overflow = 'hidden';
    void el.offsetWidth; el.classList.add('is-in');
    var f = focusEl || el.querySelector('.sheet__x'); if (f) f.focus({ preventScroll: true });
    return true;
  }
  function close() {
    if (!openEl) return;
    var el = openEl; openEl = null; el.classList.remove('is-in');
    closeT = setTimeout(function () { el.hidden = true; document.documentElement.style.overflow = ''; }, 480);
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

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
      map.querySelectorAll('.mpin.is-open').forEach(function (p) { p.classList.remove('is-open'); });
      pin.classList.add('is-open');
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


// «Подробнее о тренере»: кнопка не меняет форму, надпись сменяется; блок раскрывается долго и мягко
(function () {
  var d = document.querySelector('.trener .more'); if (!d) return;
  var s = d.querySelector('summary'), w = d.querySelector('.bio-wrap'); if (!w || !w.animate) return;
  var items = w.querySelectorAll('.bio li'), busy = false, ease = 'cubic-bezier(.16, 1, .3, 1)';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function once(fn, ms) { var done = false; var f = function () { if (!done) { done = true; fn(); } }; setTimeout(f, ms); return f; }
  s.addEventListener('click', function (e) {
    e.preventDefault(); if (busy) return; busy = true;
    if (!d.open) {
      d.open = true; d.classList.add('is-open');
      var h = w.scrollHeight, fin = once(function () { busy = false; }, 1000);
      w.animate([{ height: '0px' }, { height: h + 'px' }], { duration: 850, easing: ease }).onfinish = fin;
      items.forEach(function (li, i) {
        var mob = window.matchMedia('(max-width: 900px)').matches;
        li.animate(mob ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: mob ? 700 : 900, delay: mob ? 200 + i * 140 : 160 + i * 110, easing: ease, fill: 'backwards' });
      });
    } else {
      d.classList.remove('is-open');
      items.forEach(function (li) { li.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' }); });
      var a = w.animate([{ height: w.scrollHeight + 'px' }, { height: '0px' }], { duration: 600, delay: 90, easing: ease, fill: 'forwards' });
      var fin2 = once(function () { d.open = false; a.cancel(); items.forEach(function (li) { li.getAnimations().forEach(function (x) { x.cancel(); }); }); busy = false; }, 800);
      a.onfinish = fin2;
    }
  });
})();

// Переходы по разделам: к заголовку раздела, чуть ниже шапки, а не к верхнему отступу
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains('js-book') || a.classList.contains('js-prices')) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var sec = document.querySelector(id); if (!sec || !sec.classList.contains('band')) return;
    var target = sec.querySelector('.wrap') || sec;
    var nav = document.querySelector('.nav'), navH = nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0;
    var r = target.getBoundingClientRect(), avail = window.innerHeight - navH;
    var gap = Math.max(32, (avail - r.height) / 2);
    var y = r.top + window.scrollY - navH - gap;
    e.preventDefault();
    window.scrollTo({ top: Math.max(0, y), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
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
    setTimeout(function () { cur.classList.remove('is-off'); }, 900);
  }, 3400);
})();

// Вопросы: ответ мягко выезжает, закрывается так же плавно
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ease = 'cubic-bezier(.22, 1, .36, 1)';
  document.querySelectorAll('.qa').forEach(function (d) {
    var s = d.querySelector('summary'), p = d.querySelector('p'); if (!p || !p.animate) return;
    var busy = false;
    s.addEventListener('click', function (e) {
      e.preventDefault(); if (busy) return; busy = true;
      if (!d.open) {
        d.open = true; d.classList.add('is-open');
        var h = p.offsetHeight;
        var f1 = false, done1 = function () { if (!f1) { f1 = true; busy = false; } }; setTimeout(done1, 800);
        p.animate([{ height: '0px', opacity: 0, transform: 'translateY(-10px)' }, { height: h + 'px', opacity: 1, transform: 'none' }], { duration: 650, easing: ease }).onfinish = done1;
      } else {
        d.classList.remove('is-open');
        var a = p.animate([{ height: p.offsetHeight + 'px', opacity: 1, transform: 'none' }, { height: '0px', opacity: 0, transform: 'translateY(-8px)' }], { duration: 450, easing: ease, fill: 'forwards' });
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
