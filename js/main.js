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
  function open(el, focusEl) {
    if (!el) return false;
    if (openEl && openEl !== el) openEl.hidden = true; else lastFocus = document.activeElement;
    el.hidden = false; openEl = el; document.documentElement.style.overflow = 'hidden';
    var f = focusEl || el.querySelector('.sheet__x'); if (f) f.focus();
    return true;
  }
  function close() {
    if (!openEl) return;
    openEl.hidden = true; openEl = null; document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
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
      if (e.target.closest('.mpin__links a')) return;
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

  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
