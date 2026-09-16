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
    closeT = setTimeout(function () { el.hidden = true; closingEl = null; document.documentElement.style.overflow = ''; }, 580);
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

  // Карта. Компьютер: карточка по наведению. Телефон: сведения слева и фото справа всплывают прямо на карте;
  // зажали название — видно, пока держите; короткое нажатие — остаётся (чтобы нажать «Маршрут»), закрывается нажатием мимо или повторно
  var map = document.querySelector('.citymap'), panel = document.querySelector('.citymap__panel');
  if (map && panel) {
    var mob = window.matchMedia('(max-width: 900px)');
    if (mob.matches) map.appendChild(panel);
    var openPin = null, downAt = 0, downPin = null, swapT = null;
    var show = function (pin) {
      map.querySelectorAll('.mpin.is-open').forEach(function (p) { p.classList.remove('is-open'); p.querySelector('.mpin__dot').setAttribute('aria-expanded', 'false'); });
      pin.classList.add('is-open'); pin.querySelector('.mpin__dot').setAttribute('aria-expanded', 'true');
      openPin = pin;
      if (mob.matches) {
        var c = pin.querySelector('.mpin__card');
        var fill = function () {
          panel.innerHTML = '<div class="cp__info">' + c.querySelector('b').outerHTML + c.querySelector('.mpin__more').outerHTML + '</div><div class="cp__photo">' + c.querySelector('.mpin__img').outerHTML + '</div>';
          var low = pin.getBoundingClientRect().top - map.getBoundingClientRect().top > map.clientHeight / 2;
          panel.classList.toggle('is-up', low); // точка внизу — карточка сверху, чтобы не закрывать название
          void panel.offsetWidth; panel.classList.add('is-show');
        };
        clearTimeout(swapT);
        // уже открыт другой бассейн — сначала мягко растворяем его, потом показываем новый
        if (panel.classList.contains('is-show')) { panel.classList.remove('is-show'); swapT = setTimeout(fill, 320); }
        else fill();
      }
    };
    var hide = function () {
      map.querySelectorAll('.mpin.is-open').forEach(function (p) { p.classList.remove('is-open'); p.querySelector('.mpin__dot').setAttribute('aria-expanded', 'false'); });
      openPin = null; clearTimeout(swapT); panel.classList.remove('is-show');
    };
    map.addEventListener('click', function (e) {
      if (e.target.closest('.citymap__panel a, .mpin__more a')) return;
      if (e.target.closest('.citymap__panel')) return;
      var pin = e.target.closest('.mpin');
      if (!mob.matches) { if (pin) show(pin); return; }
      if (!pin) { hide(); return; }
      if (downPin === pin && performance.now() - downAt > 450) return; // это было удержание — его обработал touchend
      if (pin === openPin && !pin.__justOpened) { hide(); return; }
      pin.__justOpened = false;
      show(pin);
    });
    map.addEventListener('touchstart', function (e) {
      var pin = e.target.closest('.mpin'); if (!pin || !mob.matches) return;
      downPin = pin; downAt = performance.now();
      if (pin !== openPin) { show(pin); pin.__justOpened = true; }
    }, { passive: true });
    map.addEventListener('touchend', function () {
      if (downPin && performance.now() - downAt > 450) hide();
      setTimeout(function () { downPin = null; }, 50);
    }, { passive: true });
    map.addEventListener('mouseover', function (e) {
      var pin = e.target.closest('.mpin');
      if (pin && !pin.classList.contains('is-open') && window.matchMedia('(min-width: 901px) and (hover: hover)').matches) show(pin);
    });
    var first = map.querySelector('.mpin');
    if (first && !mob.matches) show(first);
  }

  // Лента фото групп: медленно едет сама; на телефоне листается пальцем (родная прокрутка), на компьютере тянется мышкой
  document.querySelectorAll('.clubrow').forEach(function (row) {
    var track = row.querySelector('.clubrow__track'); if (!track) return;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var auto = calm ? 0 : 18, v = auto, pos = 0, hold = false, idleUntil = 0, prev = performance.now();
    var drag = false, lastX = 0, lastT = 0;
    function half() { return track.scrollWidth / 2; }
    function wrap() { var h = half(); if (h <= 0) return; if (row.scrollLeft >= h) row.scrollLeft -= h; else if (row.scrollLeft <= 0) row.scrollLeft += h; pos = row.scrollLeft; }
    row.scrollLeft = 1; pos = 1;
    function frame(t) {
      var dt = Math.min(0.05, (t - prev) / 1000); prev = t;
      if (!hold && !drag && t > idleUntil) {
        v += (auto - v) * Math.min(1, dt * 1.6);
        pos += v * dt; var h = half(); if (h > 0) { if (pos >= h) pos -= h; if (pos < 0) pos += h; } row.scrollLeft = pos;
      } else { pos = row.scrollLeft; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // палец: родная прокрутка с инерцией, автопрокрутка ждёт
    row.addEventListener('touchstart', function () { hold = true; }, { passive: true });
    row.addEventListener('touchend', function () { hold = false; idleUntil = performance.now() + 1500; v = 0; }, { passive: true });
    row.addEventListener('scroll', function () { if (hold || performance.now() < idleUntil) { wrap(); if (!hold) idleUntil = performance.now() + 400; } }, { passive: true });
    // мышь: тянуть с инерцией
    row.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      drag = true; lastX = e.clientX; lastT = performance.now(); v = 0; row.classList.add('is-drag');
      try { row.setPointerCapture(e.pointerId); } catch (err) {}
    });
    row.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT) / 1000;
      row.scrollLeft -= dx; wrap(); v = v * 0.6 + (-dx / dt) * 0.4; lastX = e.clientX; lastT = now;
    });
    function up() { if (!drag) return; drag = false; row.classList.remove('is-drag'); if (performance.now() - lastT > 120) v = 0; v = Math.max(-2500, Math.min(2500, v)); }
    row.addEventListener('pointerup', up); row.addEventListener('pointercancel', up);
  });

  // Телефон: форматы и отзывы листаются по кругу
  if (window.matchMedia('(max-width: 734px)').matches) {
    document.querySelectorAll('#formaty .list, .reviews').forEach(function (box) {
      var items = Array.prototype.slice.call(box.children); if (items.length < 2) return;
      function clone(el) { var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('is-clone'); c.querySelectorAll('a, button').forEach(function (a) { a.tabIndex = -1; }); return c; }
      items.forEach(function (el) { box.appendChild(clone(el)); });
      items.slice().reverse().forEach(function (el) { box.insertBefore(clone(el), box.firstChild); });
      var n = items.length, t;
      function period() { return box.children[n * 2].offsetLeft - box.children[n].offsetLeft; }
      function center(i) { var el = box.children[i]; return el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2; }
      requestAnimationFrame(function () { box.style.scrollSnapType = 'none'; box.scrollLeft = center(n); box.style.scrollSnapType = ''; });
      box.addEventListener('scroll', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var p = period(), a = center(n), x = box.scrollLeft;
          if (x < a - p / (2 * n) || x > a + p - p / (2 * n)) {
            box.style.scrollSnapType = 'none';
            box.scrollLeft = x < a ? x + p : x - p;
            box.style.scrollSnapType = '';
          }
        }, 120);
      }, { passive: true });
    });
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
    var from = window.scrollY, dist = to - from, dur = Math.abs(dist) < 500 ? 700 : 900, t0 = null; // одинаковая скорость независимо от расстояния
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
document.querySelectorAll('.slides').forEach(function (box) {
  var items = box.querySelectorAll('.slide'), i = 0;
  if (items.length < 2) return;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  items.forEach(function (im) { im.loading = 'eager'; });
  // на первом экране вместе с фото меняется подпись; кадры можно листать пальцем, мышью, стрелками и точками
  var wrapEl = box.closest('.portret'), caps = wrapEl ? wrapEl.querySelectorAll('.cap') : [], paused = false, timer = null, dots = [];
  function go(n) {
    n = (n + items.length) % items.length; if (n === i) return;
    var cur = items[i]; i = n; var nx = items[i];
    // новый кадр проявляется поверх старого, старый уходит только когда его уже закрыли — без просвечивания двух кадров
    items.forEach(function (im) { im.classList.remove('was-on'); });
    cur.classList.remove('is-on'); cur.classList.add('was-on'); cur.setAttribute('aria-hidden', 'true');
    nx.classList.add('is-on'); nx.removeAttribute('aria-hidden');
    setTimeout(function () { cur.classList.remove('was-on'); }, 1800);
    if (caps.length === items.length) caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); if (k === i) c.removeAttribute('aria-hidden'); else c.setAttribute('aria-hidden', 'true'); });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
  }
  function plan(ms) { clearTimeout(timer); if (calm) return; timer = setTimeout(tick, ms); }
  function tick() { if (document.hidden || paused) { plan(1000); return; } go(i + 1); plan(caps.length ? (i === 0 ? 9000 : 7500) : 5200); }
  function manual(n) { go(n); plan(14000); } // после ручного листания автосмена ждёт дольше
  plan(caps.length ? 9000 : 5200);
  if (!wrapEl) return;
  // стрелки и точки
  var ctr = document.createElement('div'); ctr.className = 'hs';
  ctr.innerHTML = '<button class="hs__arr" type="button" data-d="-1" aria-label="Предыдущее фото">←</button><div class="hs__dots"></div><button class="hs__arr" type="button" data-d="1" aria-label="Следующее фото">→</button>';
  var dw = ctr.querySelector('.hs__dots');
  items.forEach(function (_, k) { var d = document.createElement('button'); d.type = 'button'; d.className = 'hs__dot' + (k === 0 ? ' is-on' : ''); d.setAttribute('aria-label', 'Фото ' + (k + 1)); d.addEventListener('click', function () { manual(k); }); dw.appendChild(d); dots.push(d); });
  ctr.querySelectorAll('.hs__arr').forEach(function (b) { b.addEventListener('click', function () { manual(i + +b.dataset.d); }); });
  box.parentNode.insertBefore(ctr, box.nextSibling);
  // свайп пальцем и перетаскивание мышью
  var x0 = null, y0 = 0, t0 = 0;
  box.style.touchAction = 'pan-y';
  box.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); });
  box.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && Date.now() - t0 < 900) manual(i + (dx < 0 ? 1 : -1));
  });
  box.addEventListener('pointercancel', function () { x0 = null; });
  document.addEventListener('keydown', function (e) {
    if (!wrapEl.matches(':hover')) return;
    if (e.key === 'ArrowRight') manual(i + 1); if (e.key === 'ArrowLeft') manual(i - 1);
  });
});


// Анкеты (внизу страницы и в окне записи): собирают сообщение для Telegram и WhatsApp
(function () {
  function init(q) {
    var pre = q.dataset.names || '';
    var prev = q.querySelector('.qz__preview'), tg = q.querySelector('.qz__tg'), wa = q.querySelector('.qz__wa');
    function val(n) { var c = q.querySelector('input[name="' + pre + n + '"]:checked'); return c ? c.value : ''; }
    function pick(n, v) { var i = q.querySelector('input[name="' + pre + n + '"][value="' + v + '"]'); if (i) i.checked = true; }
    function build() {
      var lvl = val('lvl'), pool = val('pool');
      var msg = 'Здравствуйте, Анатолий! Хочу на бесплатную пробную тренировку. Формат: ' + val('fmt').toLowerCase() + '.' +
        (lvl ? ' Сейчас ' + lvl + '.' : '') + (pool ? ' Бассейн: ' + (pool === 'подскажите' ? 'подскажите, какой подойдёт' : pool) + '.' : '');
      if (prev.textContent && prev.textContent !== msg) { prev.classList.remove('is-new'); void prev.offsetWidth; prev.classList.add('is-new'); } // подсветка: сообщение изменилось
      prev.textContent = msg;
      tg.href = 'https://t.me/shabarshov?text=' + encodeURIComponent(msg);
      wa.href = 'https://wa.me/79969669160?text=' + encodeURIComponent(msg);
    }
    q.addEventListener('change', function (e) {
      var n = e.target.name.slice(pre.length);
      if (n === 'pool' && e.target.value === 'Лужники') pick('fmt', 'Персонально'); // в Лужниках только персональные
      if (n === 'fmt' && e.target.value !== 'Персонально' && val('pool') === 'Лужники') pick('pool', 'подскажите');
      build();
    });
    q.preset = function (msg) { // кнопка записи подсказывает формат
      msg = msg || '';
      if (/Лужник/.test(msg)) { pick('fmt', 'Персонально'); pick('pool', 'Лужники'); }
      else if (/персональн/i.test(msg)) pick('fmt', 'Персонально');
      else if (/открытой воде/.test(msg)) pick('fmt', 'Открытая вода');
      else if (/в группу/.test(msg)) pick('fmt', 'Группа');
      build();
    };
    build();
  }
  document.querySelectorAll('.qz').forEach(init);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.js-book'); if (!a) return;
    var sq = document.querySelector('.qz--sheet'); if (sq && sq.preset) sq.preset(a.getAttribute('data-msg'));
  });
})();

// Окно цен: переключатель «Группы / Индивидуально»
(function () {
  var box = document.querySelector('#prices .pt'); if (!box) return;
  var btns = box.querySelectorAll('.pt__b'), panes = document.querySelectorAll('#prices .pp__pane'), wrap = document.querySelector('#prices .pp');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('is-on')) return;
      var key = b.dataset.pane, from = wrap.offsetHeight;
      btns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
      box.classList.toggle('is-right', key === 'i');
      panes.forEach(function (p) { var on = p.dataset.pane === key; p.hidden = !on; p.classList.toggle('is-on', on); });
      // плавная смена высоты окна
      var cs = getComputedStyle(wrap), to = 0; // высота без сдвига анимации появления
      panes.forEach(function (p) { if (!p.hidden) to += p.offsetHeight; });
      to += parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); wrap.style.height = from + 'px'; void wrap.offsetHeight;
      wrap.style.height = to + 'px';
      setTimeout(function () { wrap.style.height = ''; }, 720);
    });
  });
})();

// Отзывы на компьютере: лента вправо-влево со стрелками
(function () {
  var box = document.querySelector('.reviews'), nav = document.querySelector('.rv-nav'); if (!box || !nav) return;
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('.rv-nav__b'); if (!b) return;
    var card = box.querySelector('.review'); var step = card ? card.getBoundingClientRect().width + 24 : 360;
    glide(box.scrollLeft + step * +b.dataset.dir);
  });
  // своя плавная прокрутка ленты: медленный разгон и долгое торможение
  var raf = null, guard = null;
  function glide(to) {
    to = Math.max(0, Math.min(to, box.scrollWidth - box.clientWidth));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { box.scrollLeft = to; return; }
    var from = box.scrollLeft, dist = to - from, t0 = null, dur = 900, snap = box.style.scrollSnapType;
    cancelAnimationFrame(raf); clearTimeout(guard);
    if (document.hidden) { box.scrollLeft = to; return; } // вкладка спрятана — кадры не идут, двигаем сразу
    box.style.scrollSnapType = 'none';
    function done() { box.style.scrollSnapType = snap; clearTimeout(guard); }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      box.scrollLeft = from + dist * e;
      if (k < 1) raf = requestAnimationFrame(step); else done();
    }
    raf = requestAnimationFrame(step);
    // страховка: если кадры встали (ушли в другую вкладку) — доводим ленту и возвращаем привязку
    guard = setTimeout(function () { cancelAnimationFrame(raf); box.scrollLeft = to; done(); }, dur + 400);
  }
  function upd() { var max = box.scrollWidth - box.clientWidth - 2; nav.children[0].disabled = box.scrollLeft <= 2; nav.children[1].disabled = box.scrollLeft >= max; }
  box.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
})();

// Телефон: запоминаем высоту окна один раз; при прокрутке панель браузера прячется, но фото первого экрана не растягивается
(function () {
  var root = document.documentElement, w = window.innerWidth;
  function set() { root.style.setProperty('--hero-vh', window.innerHeight + 'px'); }
  set();
  window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - w) > 40) { w = window.innerWidth; set(); } });
  window.addEventListener('orientationchange', function () { setTimeout(function () { w = window.innerWidth; set(); }, 350); });
})();
