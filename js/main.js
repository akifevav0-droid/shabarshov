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

  // Кнопки записи: окно выбора мессенджера с подставленным текстом (нет Telegram — есть WhatsApp и звонок)
  var tg = document.getElementById('tg'), wa = document.getElementById('wa');
  var sheet = document.getElementById('sheet'), sTg = document.getElementById('sheet-tg'), sWa = document.getElementById('sheet-wa');
  var lastFocus = null;
  function setMsg(msg) {
    var q = encodeURIComponent(msg);
    [tg, sTg].forEach(function (a) { if (a) a.href = 'https://t.me/shabarshov?text=' + q; });
    [wa, sWa].forEach(function (a) { if (a) a.href = 'https://wa.me/79969669160?text=' + q; });
  }
  function openSheet(msg) {
    if (!sheet) return false;
    setMsg(msg); lastFocus = document.activeElement;
    sheet.hidden = false; document.documentElement.style.overflow = 'hidden';
    if (sTg) sTg.focus();
    return true;
  }
  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true; document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('a[data-msg]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var msg = a.getAttribute('data-msg');
      if (a.classList.contains('js-book') && openSheet(msg)) { e.preventDefault(); } else { setMsg(msg); }
    });
  });
  if (sheet) {
    sheet.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeSheet); });
    sheet.querySelectorAll('.sheet__btn').forEach(function (el) { el.addEventListener('click', function () { setTimeout(closeSheet, 300); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  }

  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
