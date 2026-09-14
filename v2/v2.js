(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = window.matchMedia('(max-width: 720px)');

  // Шапка: прозрачная на фото, белая после первого экрана
  var top = document.getElementById('top'), hero = document.querySelector('.hero');
  function onScroll() { top.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - 90); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Первый экран: смена кадров. Новый проявляется поверх старого, старый уходит, когда уже закрыт
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
        el.style.transitionDelay = Math.min(sib.indexOf(el), 3) * 90 + 'ms';
        el.classList.add('in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Анкета: собирает сообщение для Telegram и WhatsApp
  var quiz = document.getElementById('quiz'), prev = document.getElementById('quiz-preview'),
      tg = document.getElementById('quiz-tg'), wa = document.getElementById('quiz-wa');
  function val(n) { var c = quiz.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : ''; }
  function build() {
    var msg = 'Здравствуйте, Анатолий! Хочу на бесплатную пробную тренировку. Цель: ' + val('goal').toLowerCase() + '. Сейчас ' + val('lvl') + '. Бассейн: ' + val('pool') + '.';
    prev.textContent = msg;
    tg.href = 'https://t.me/shabarshov?text=' + encodeURIComponent(msg);
    wa.href = 'https://wa.me/79969669160?text=' + encodeURIComponent(msg);
  }
  quiz.addEventListener('change', build); build();
  function pick(name, value) {
    var inp = quiz.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (inp) { inp.checked = true; build(); }
  }
  // «Записаться» в карточке формата и «Хочу сюда» у бассейна заранее отмечают ответ
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-goal],[data-pool]'); if (!a) return;
    if (a.dataset.pool) pick('pool', a.dataset.pool === 'Лужники' ? 'Лужники, персонально' : a.dataset.pool);
    if (a.dataset.goal === 'Открытая вода') pick('goal', 'Открытая вода или триатлон');
  });

  // Окно цен
  var dlg = document.getElementById('prices');
  document.querySelectorAll('.js-prices').forEach(function (b) { b.addEventListener('click', function () { dlg.showModal(); }); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

  // Нижняя плашка записи на телефоне: видна всегда, кроме раздела записи
  var dock = document.getElementById('dock'), zapis = document.getElementById('zapis');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { dock.classList.toggle('is-on', !es[0].isIntersecting); }, { threshold: 0.05 }).observe(zapis);
  } else dock.classList.add('is-on');
})();
