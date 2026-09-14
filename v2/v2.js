(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = window.matchMedia('(max-width: 720px)');
  var root = document.documentElement;

  // Шапка: прозрачная на фото, светлая над светлыми разделами, тёмная над тёмными
  var top = document.getElementById('top'), hero = document.querySelector('.hero');
  var darks = [].slice.call(document.querySelectorAll('.sec--dark, .proof'));
  function onScroll() {
    var y = window.scrollY, h = top.offsetHeight;
    var past = y > hero.offsetHeight - h;
    var overDark = past && darks.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= h / 2 && r.bottom >= h / 2; });
    top.classList.toggle('is-dark', overDark);
    top.classList.toggle('is-solid', past && !overDark);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();

  // Мобильное меню
  var btn = document.querySelector('.top__menu'), mnav = document.getElementById('mnav');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    root.classList.toggle('menu-open', open);
    if (open) { mnav.hidden = false; requestAnimationFrame(function () { mnav.classList.add('is-open'); }); }
    else { mnav.classList.remove('is-open'); setTimeout(function () { if (!mnav.classList.contains('is-open')) mnav.hidden = true; }, 350); }
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });

  // Первый экран: новый кадр проявляется поверх старого, старый уходит, когда уже закрыт
  var slides = [].slice.call(document.querySelectorAll('.hero .slide')), cur = 0;
  function place() { slides.forEach(function (s) { s.style.objectPosition = phone.matches ? (s.dataset.m || '') : ''; }); }
  place(); phone.addEventListener('change', place);
  if (slides.length > 1 && !calm) {
    slides.forEach(function (s, i) { if (i) { var im = new Image(); im.src = s.src; } });
    setInterval(function () {
      if (document.hidden) return;
      var prev = slides[cur]; cur = (cur + 1) % slides.length; var next = slides[cur];
      slides.forEach(function (s) { s.classList.remove('was-on'); });
      prev.classList.remove('is-on'); prev.classList.add('was-on');
      next.classList.add('is-on');
      setTimeout(function () { prev.classList.remove('was-on'); }, 1000);
    }, 6000);
  }

  // Появление при прокрутке
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = [].slice.call(el.parentNode.children).filter(function (x) { return x.classList.contains('rv'); });
        el.style.transitionDelay = Math.min(sib.indexOf(el), 2) * 90 + 'ms';
        el.classList.add('in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .1 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Анкета: собирает сообщение для Telegram и WhatsApp
  var quiz = document.getElementById('quiz'), prev = document.getElementById('quiz-preview'),
      tg = document.getElementById('quiz-tg'), wa = document.getElementById('quiz-wa');
  function val(n) { var c = quiz.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : ''; }
  function build() {
    var pool = val('pool');
    var msg = 'Здравствуйте, Анатолий! Хочу на бесплатную пробную тренировку. Формат: ' + val('fmt').toLowerCase() +
      '. Сейчас ' + val('lvl') + '. Бассейн: ' + (pool === 'подскажите' ? 'подскажите, какой подойдёт' : pool) + '.';
    prev.textContent = msg;
    tg.href = 'https://t.me/shabarshov?text=' + encodeURIComponent(msg);
    wa.href = 'https://wa.me/79969669160?text=' + encodeURIComponent(msg);
  }
  quiz.addEventListener('change', build); build();
  function pick(name, value) {
    var inp = quiz.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (inp) { inp.checked = true; build(); }
  }
  // Кнопки записи у форматов и бассейнов заранее отмечают ответы в анкете
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-fmt],[data-pool]'); if (!a) return;
    if (a.dataset.fmt) pick('fmt', a.dataset.fmt);
    if (a.dataset.pool) {
      pick('pool', a.dataset.pool);
      pick('fmt', a.dataset.pool === 'Лужники' ? 'Персонально' : 'Группа');
    }
  });

  // Окно абонементов
  var dlg = document.getElementById('prices'), opener = null;
  document.querySelectorAll('.js-prices').forEach(function (b) { b.addEventListener('click', function () { opener = b; dlg.showModal(); }); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });

  // Нижняя плашка на телефоне: скрыта на первом экране и в разделе записи
  var dock = document.getElementById('dock'), zapis = document.getElementById('zapis');
  var inHero = true, inZapis = false;
  function dockUpd() { dock.classList.toggle('is-on', !inHero && !inZapis); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inHero = es[0].isIntersecting; dockUpd(); }, { threshold: 0.35 }).observe(hero);
    new IntersectionObserver(function (es) { inZapis = es[0].isIntersecting; dockUpd(); }, { threshold: 0.05 }).observe(zapis);
  } else { inHero = false; dockUpd(); }
})();

// Цифры набегают при появлении
(function () {
  var els = document.querySelectorAll('.count');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      var el = e.target, to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); k = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * k).toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  els.forEach(function (el) { io.observe(el); });
})();
